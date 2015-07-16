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


Router.route('/', function () {
    Router.go('welcome');
});

Router.route('welcome');

Router.route('readme');

Router.route('manageGroups');

Router.route('createGroup');

Router.route('enrolledGroups', {
    waitOn: function () {
        return Meteor.subscribe('enrolledGroups');
    }
});

Router.route('codepad/:id', {
    name: 'codepad',
    waitOn: function () {
        return Meteor.subscribe('codepad', this.params.id);
    },
    data: function () {
        return Attempts.findOne(this.params.id);
    }
});

Router.route('groupView/:_id', {
    name: 'groupView',
    waitOn: function () {
        return Meteor.subscribe('groupInfo', this.params._id);
    },
    data: function () {
        return Groups.findOne(this.params._id);
    }
});

Router.route('questionManager', {
    waitOn: function () {
        return Meteor.subscribe('allQuestions');
    }
});

Router.route('submitQuestion', {
    //TODO: remove after beta
    waitOn: function () {
        return Meteor.subscribe('betaGroups');
    }
});

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

Router.route('uploadCode/:id', {
    name: 'uploadCode'
});