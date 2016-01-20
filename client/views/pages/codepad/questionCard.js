Template.questionCard.helpers({
    question: function () {
        return Questions.findOne(Template.instance().data.questionId);
    },
    author: function () {
        var user = Meteor.users.findOne(this.createdBy);
        return user ? user.profile.name : '';
    }
});