var appRoot = '';

Router.configure({
    layoutTemplate: 'topNavLayout',
    notFoundTemplate: 'notFound',
    loadingTemplate: 'loading'
});

var requireLogin = function() {
    if (! Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        this.next();
    }
};

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
        if (Roles.userIsInRole(Meteor.userId(), ['admin','instructor','ta'])) {
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
        if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
            this.next();
        } else {
            this.render('accessDenied');
        }
    }
};

var requireOwner = function () {
    if (! Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        if (Roles.userIsInRole(Meteor.userId(), 'admin') || Q) {
            this.next();
        } else {
            this.render('accessDenied');
        }
    }
};


/** Public pages **/
Router.route(appRoot.length === 0 ? '/' : appRoot, function () {
    Router.go('welcome');
});

Router.route(appRoot + 'welcome', {
    name: 'welcome'
});

Router.route(appRoot + 'readme', {
    name: 'readme'
});




/** Student Access **/

Router.onBeforeAction(requireLogin, {only: 'joinGroups'});
Router.route(appRoot + 'joinGroups', {
    name: 'joinGroups',
    waitOn: function () {
        return Meteor.subscribe('availableGroups');
    }
});

Router.onBeforeAction(requireLogin, {only: 'assignments'});
Router.route(appRoot + 'assignments', {
    name: 'assignments',
    waitOn: function () {
        return Meteor.subscribe('assignments');
    }
});

Router.onBeforeAction(requireLogin, {only: 'codepad'});
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
        var group = Groups.findOne(this.params._id);
        if (!group) {
            this.render('notFound');
        } else {
            if (_.find(group.exercises, function (exercise) {
                    return exercise._id;
                }) === undefined) {
                this.render('notFound');
                return;
            }
        }
        if (!Roles.userIsInRole(Meteor.userId(), ['admin']) || group.createdBy !== Meteor.userId() && group.teachingTeam.indexOf(Meteor.userId()) < 0) {
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

Router.onBeforeAction(requireTeachingTeam, {only: 'groupView'});
Router.route(appRoot + 'groupView/:_id', {
    name: 'groupView',
    action: function () {
        var group = Groups.findOne(this.params._id);
        if (!group) {
            this.render('notFound');
            return;
        }
        if (!Roles.userIsInRole(Meteor.userId(), ['admin']) || group.createdBy !== Meteor.userId() && group.teachingTeam.indexOf(Meteor.userId()) < 0) {
            this.render('accessDenied');
            return;
        }
        this.render();
    },
    waitOn: function () {
        return Meteor.subscribe('groupInfo', this.params._id);
    },
    data: function () {
        return Groups.findOne(this.params._id);
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