Template.manageQuestions.onCreated(function () {
    var template = this;

    //check if user has contributed questions
    template.hasContributedQuestions = new ReactiveVar(false);
    Meteor.call('hasContributedQuestions', Meteor.userId(), function (err, res) {
        if (!err) {
            template.hasContributedQuestions.set(res);
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
            return params;
        } else {
            params.limit =  30;
            return params;  //set limit to number of questions allowed to load
        }
    }
});