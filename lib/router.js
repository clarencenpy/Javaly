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
Router.onBeforeAction(requireLogin, {only: 'uploadCode'});
Router.onBeforeAction(requireLogin, {only: 'codepad'});


Router.route('/', function () {
    Router.go('questionBank');
});

Router.route('questionBank');

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

Router.route('questionManager');

Router.route('submitQuestion');

Router.route('uploadCode/:id', {
    name: 'uploadCode'
});