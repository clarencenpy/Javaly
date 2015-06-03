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

    Router.route('/pageOne', function () {
    this.render('pageOne');
});

Router.route('/upload', function () {
    this.render('uploadForm');
});

Router.route('/', function () {
    Router.go('submitQuestion');
});

Router.route('/submitQuestion', function () {
    this.render('submitQuestion');
});