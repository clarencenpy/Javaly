var appRoot = '';

Router.configure({
    layoutTemplate: 'topNavLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading'
});

Router.onRun(function(){
    if ( !Meteor.user() ) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            Router.go('landing');
        }
    } else {
        this.next();
    }
}, {except: 'landing'});
Router.onRerun(function(){
    if ( !Meteor.user() ) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            Router.go('landing');
        }
    } else {
        this.next();
    }
}, {except: 'landing'});

var requireInstructor = function () {
    if (! Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        if (Roles.userIsInRole(Meteor.userId(), ['admin','instructor'])) {
            this.next();
        } else {
            this.render('accessDenied');
        }
    }
};

var requireTeachingTeam = function () {
    if (! Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        if (Roles.userIsInRole(Meteor.userId(), ['admin','instructor', 'ta'])) {
            this.next();
        } else {
            this.render('accessDenied');
        }
    }
};

var requireAdmin = function () {
    if (! Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            this.next();
        } else {
            this.render('accessDenied');
        }
    }
};


/** Public pages **/
Router.route(appRoot.length === 0 ? '/' : appRoot, function () {
    Router.go('landing');
});

Router.route(appRoot + 'landing', {
    name: 'landing'
});

Router.route(appRoot + 'readme', {
    name: 'readme'
});




/** Student Access **/

Router.route(appRoot + 'joinGroups', {
    name: 'joinGroups',
    waitOn: function () {
        return Meteor.subscribe('availableGroups');
    }
});

Router.route(appRoot + 'assignments', {
    name: 'assignments',
    waitOn: function () {
        return Meteor.subscribe('assignments');
    }
});

Router.route(appRoot + 'codepad/:_id', {
    name: 'codepad',
    action: function () {
        var attempt = Attempts.findOne(this.params._id);
        if (!attempt) {
            this.render('notFound');
        }
        if (attempt.userId !== Meteor.userId()) {
            this.render('accessDenied');
            return;
        }
        this.render();
    },
    waitOn: function () {
        return [
            Meteor.subscribe('codepad', this.params._id),
            Meteor.subscribe('assignments')
        ]
    },
    data: function () {
        return Attempts.findOne(this.params._id);
    }
});


/** Instructor/TA Access **/

// Managing groups
Router.onBeforeAction(requireInstructor, {only: 'createGroup'});
Router.route(appRoot + 'createGroup',  {
    name: 'createGroup',
    waitOn: function () {
        return Meteor.subscribe('allUsers');
    }
});

Router.onBeforeAction(requireInstructor, {only: 'updateGroup'});
Router.route(appRoot + 'updateGroup/:_id',  {
    name: 'updateGroup',
    action: function () {
        var group = Groups.findOne(this.params._id);
        if (!group) {
            this.render('notFound');
            return;
        }
        if (!Roles.userIsInRole(Meteor.userId(), ['admin']) && group.createdBy !== Meteor.userId()) {
            this.render('accessDenied');
            return;
        }
        this.render();
    },
    waitOn: function () {
        return [
            Meteor.subscribe('group', this.params._id),
            Meteor.subscribe('allUsers')
        ];
    },
    data: function () {
        return Groups.findOne(this.params._id);
    }
});

Router.onBeforeAction(requireTeachingTeam, {only: 'manageGroups'});
Router.route(appRoot + 'manageGroups', {
    name: 'manageGroups',
    waitOn: function () {
        return [
            Meteor.subscribe('myGroups'),
            Meteor.subscribe('allUsers')
        ]
    },
    data: function () {
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            return Groups.find({}, {sort: {updatedAt: -1}});
        }
        return Groups.find({$or: [{createdBy: Meteor.userId()}, {teachingTeam: Meteor.userId()}]}, {sort: {createdAt: -1}});
    }
});

Router.onBeforeAction(requireTeachingTeam, {only: 'exerciseBuilder'});
Router.route(appRoot + 'exerciseBuilder/:groupId/:exerciseId', {
    name: 'exerciseBuilder',
    action: function () {
        var groupId = this.params.groupId;
        var exerciseId = this.params.exerciseId;
        var group = Groups.findOne(groupId);
        if (!group) {
            this.render('notFound');
            return;
        } else {
            if (_.find(group.exercises, function (exercise) {
                    return exercise._id === exerciseId;
                }) === undefined) {
                this.render('notFound');
                return;
            }
        }
        if (!Roles.userIsInRole(Meteor.userId(), ['admin']) && group.createdBy !== Meteor.userId() && group.teachingTeam.indexOf(Meteor.userId()) < 0) {
            this.render('accessDenied');
            return;
        }
        this.render();
    },
    waitOn: function () {
        return [
            Meteor.subscribe('group', this.params.groupId),
            Meteor.subscribe('questionTitles')
        ]
    },
    data: function () {
        return Groups.findOne(this.params.groupId);
    }
});

Router.onBeforeAction(requireTeachingTeam, {only: 'manageTags'});
Router.route(appRoot + 'manageTags', {
    name: 'manageTags'
});

Router.onBeforeAction(requireTeachingTeam, {only: 'exerciseDashboard'});
Router.route(appRoot + 'exerciseDashboard/:groupId/:exerciseId', {
    name: 'exerciseDashboard',
    action: function () {
        var group = Groups.findOne(this.params.groupId);
        var exerciseId = this.params.exerciseId;
        if (!group) {
            this.render('notFound');
            return;
        } else {
            if (_.find(group.exercises, function (exercise) {
                    return exercise._id === exerciseId;
                }) === undefined) {
                this.render('notFound');
                return;
            }
        }
        if (!Roles.userIsInRole(Meteor.userId(), ['admin']) && group.createdBy !== Meteor.userId() && group.teachingTeam.indexOf(Meteor.userId()) < 0) {
            this.render('accessDenied');
            return;
        }
        this.render();
    },
    waitOn: function () {
        return Meteor.subscribe('exerciseDashboard', this.params.groupId, this.params.exerciseId);
    }
});


// Managing questions
Router.onBeforeAction(requireTeachingTeam, {only: 'manageQuestions'});
Router.route(appRoot + 'manageQuestions', {
    name: 'manageQuestions'
});

Router.onBeforeAction(requireTeachingTeam, {only: 'submitQuestion'});
Router.route(appRoot + 'submitQuestion', {
    name: 'submitQuestion'
});

Router.onBeforeAction(requireTeachingTeam, {only: 'updateQuestion'});
Router.route(appRoot + 'updateQuestion/:_id', {
    name: 'updateQuestion',
    action: function () {
        var question = Questions.findOne(this.params._id);
        if (!question) {
            this.render('notFound');
            return;
        }
        if (!Roles.userIsInRole(Meteor.userId(), ['admin']) && question.createdBy !== Meteor.userId()) {
            this.render('accessDenied');
            return;
        }

        this.render();

    },
    waitOn: function () {
        return [
            Meteor.subscribe('question', this.params._id),
            Meteor.subscribe('attemptFromQuestionId', this.params._id)
        ];
    },
    data: function () {
        return Questions.findOne(this.params._id);
    }
});



/** Admin Only Access **/
Router.onBeforeAction(requireAdmin, {only: 'roles'});
Router.route(appRoot + 'admin/roles', {
    name: 'roles',
    waitOn: function () {
        return Meteor.subscribe('allUsers');
    },
    data: function () {
        return Meteor.users.find();
    }
});