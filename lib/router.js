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

Router.route('/questionBank', function () {
   this.render('questionBank');
});

Router.route('/codepad/:id', {
    name: 'codepad',
    data: function () {
        return Attempts.findOne(this.params.id);
    }
});

Router.route('/submitQuestion', function () {
    this.render('submitQuestion');
});

Router.route('/uploadCode/:id', {
    name: 'uploadCode'
});