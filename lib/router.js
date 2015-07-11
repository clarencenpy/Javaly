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


Router.route('/', function () {
    Router.go('questionBank');
});

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
        return Meteor.subscribe('attempt', this.params.id);
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
        Meteor.subscribe('betaGroups');
    }
});

Router.route('uploadCode/:id', {
    name: 'uploadCode'
});