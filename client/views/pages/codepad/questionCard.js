Template.questionCard.helpers({
    question: function () {
        return Questions.findOne(this.toString());  //data context this is somehow interpreted as an object
    },
    author: function () {
        return Meteor.users.findOne(this.createdBy).profile.name;
    }
});