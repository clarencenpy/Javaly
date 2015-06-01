Router.configure({
    layoutTemplate: 'mainLayout',
    notFoundTemplate: 'notFound'

});

//
// Example pages routes
//

Router.route('/pageOne', function () {
    this.render('pageOne');
});

Router.route('/upload', function () {
    this.render('uploadForm');
});

Router.route('/', function () {
    Router.go('pageOne');
});
