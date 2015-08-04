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

Router.onBeforeAction(requireLogin, {only: 'submitQuestion'});
Router.onBeforeAction(requireLogin, {only: 'questionManager'});
Router.onBeforeAction(requireLogin, {only: 'codepad'});
Router.onBeforeAction(requireLogin, {only: 'manageGroups'});
Router.onBeforeAction(requireLogin, {only: 'enrolledGroups'});
Router.onBeforeAction(requireLogin, {only: 'groupView'});

var Subs = new SubsManager();

Router.route('/', function () {
    Router.go('welcome');
});

Router.route('welcome');

Router.route('readme');

Router.route('manageGroups');

Router.route('editExercise/:groupId/:exerciseId', {
    name: 'editExercise',
    waitOn: function () {
        return [
            Subs.subscribe('group', this.params.groupId),
            Subs.subscribe('questionBank')
        ];
    },
    data: function () {
        return Groups.findOne(this.params.groupId);
    }
});

Router.route('createGroup',  {
    waitOn: function () {
        return Subs.subscribe('questionBank');
    }
});

Router.route('enrolledGroups', {
    waitOn: function () {
        return Subs.subscribe('enrolledGroups');
    }
});

Router.route('codepad/:id', {
    name: 'codepad',
    waitOn: function () {
        return Subs.subscribe('codepad', this.params.id);
    },
    data: function () {
        return Attempts.findOne(this.params.id);
    }
});

Router.route('groupView/:_id', {
    name: 'groupView',
    waitOn: function () {
        return Subs.subscribe('groupInfo', this.params._id);
    },
    data: function () {
        return Groups.findOne(this.params._id);
    }
});

Router.route('questionManager', {
    waitOn: function () {
        return Subs.subscribe('allQuestions');
    }
});

Router.route('submitQuestion', {
    //TODO: remove after beta
    waitOn: function () {
        return Subs.subscribe('betaGroups');
    }
});

Router.route('updateQuestion/:_id', {
    name: 'updateQuestion',
    waitOn: function () {
        return [
            Subs.subscribe('question', this.params._id),
            Subs.subscribe('attemptFromQuestionId', this.params._id)
        ];
    },
    data: function () {
        return Questions.findOne(this.params._id);
    }
});

Router.route('uploadCode/:id', {
    name: 'uploadCode'
});