Router.configure({
    layoutTemplate: 'mainLayout',
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


/** Public pages **/

Router.route('/', function () {
    Router.go('welcome');
});

Router.route('welcome');

Router.route('readme');




/** Student Access **/

Router.onBeforeAction(requireLogin, {only: 'joinGroups'});
Router.route('joinGroups', {
    waitOn: function () {
        return Meteor.subscribe('availableGroups');
    }
});

Router.onBeforeAction(requireLogin, {only: 'assignments'});
Router.route('assignments', {
    waitOn: function () {
        return Meteor.subscribe('assignments');
    }
});

Router.onBeforeAction(requireLogin, {only: 'codepad'});
Router.route('codepad/:id', {
    name: 'codepad',
    waitOn: function () {
        return [
            Meteor.subscribe('codepad', this.params.id),
            Meteor.subscribe('assignments')
        ]
    },
    data: function () {
        return Attempts.findOne(this.params.id);
    }
});


/** Instructor/TA Access **/

// Managing groups
Router.onBeforeAction(requireInstructor, {only: 'createGroup'});
Router.route('createGroup',  {
    waitOn: function () {
        return Meteor.subscribe('allUsers');
    }
});

Router.onBeforeAction(requireInstructor, {only: 'updateGroup'});
Router.route('updateGroup/:_id',  {
    name: 'updateGroup',
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
Router.route('manageGroups', {
    waitOn: function () {
        return [
            Meteor.subscribe('myGroups'),
            Meteor.subscribe('allUsers')
        ]
    },
    data: function () {
        return Groups.find({$or: [{createdBy: Meteor.userId()}, {teachingTeam: Meteor.userId()}]});
    }
});


Router.onBeforeAction(requireTeachingTeam, {only: 'editExercise'});
Router.route('editExercise/:groupId/:exerciseId', {
    name: 'editExercise',
    waitOn: function () {
        return [
            Meteor.subscribe('group', this.params.groupId),
            Meteor.subscribe('questionBank')
        ];
    },
    data: function () {
        return Groups.findOne(this.params.groupId);
    }
});

Router.onBeforeAction(requireTeachingTeam, {only: 'groupView'});
Router.route('groupView/:_id', {
    name: 'groupView',
    waitOn: function () {
        return Meteor.subscribe('groupInfo', this.params._id);
    },
    data: function () {
        return Groups.findOne(this.params._id);
    }
});

// Managing questions
Router.onBeforeAction(requireTeachingTeam, {only: 'questionManager'});
Router.route('questionManager', {
    waitOn: function () {
        return Meteor.subscribe('allQuestions');
    }
});

Router.onBeforeAction(requireTeachingTeam, {only: 'submitQuestion'});
Router.route('submitQuestion');

Router.onBeforeAction(requireTeachingTeam, {only: 'updateQuestion'});
Router.route('updateQuestion/:_id', {
    name: 'updateQuestion',
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
Router.route('admin/roles', {
    name: 'roles',
    waitOn: function () {
        return Meteor.subscribe('allUsers');
    },
    data: function () {
        return Meteor.users.find();
    }
});




Router.route('uploadCode/:id', {
    name: 'uploadCode'
});