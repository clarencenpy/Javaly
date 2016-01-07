Template.manageQuestions.onCreated(function () {
    var template = this;

    //check if user has contributed questions
    template.hasContributedQuestions = new ReactiveVar(false);
    template.methodCallReady = new ReactiveVar(false);
    Meteor.call('hasContributedQuestions', Meteor.userId(), function (err, res) {
        if (!err) {
            template.hasContributedQuestions.set(res);
            template.methodCallReady.set(true);
        }
    });
});

Template.manageQuestions.helpers({
    searchParams: function () {
        var params = {excludeContent: true};
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            return params;
        }
        if (Template.instance().hasContributedQuestions.get()) {
            params.author = Meteor.userId();
        } else {
            params.limit =  30;
        }
        return params;
    },
    methodCallReady: function () {
        return Template.instance().methodCallReady.get();
    }
});