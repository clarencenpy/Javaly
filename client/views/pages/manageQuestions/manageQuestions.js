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
        if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            return {limit: 50};
        }
        if (Template.instance().hasContributedQuestions.get()) {
            return {author: Meteor.userId()};
        } else {
            return {limit: 30};  //set limit to number of questions allowed to load
        }
    }
});