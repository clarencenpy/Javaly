Template.questionCard.helpers({
    question: function () {
        return Questions.findOne(this.toString());  //data context this is somehow interpreted as an object
    },
    author: function () {
        var user = Meteor.users.findOne(this.createdBy);
        return user ? user.profile.name : '';
    }
});