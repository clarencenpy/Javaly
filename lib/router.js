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


Router.route('/codepad/:id', {
    name: 'codepad',
    data: function () {
        return Attempts.findOne(this.params.id);
    }
});


//Router.route('/', function () {
//    Router.go('submitQuestion');
//});

Router.route('/submitQuestion', function () {
    this.render('submitQuestion');
});

Router.route('/uploadCode/:id', function () {
    this.render('uploadCode');
});