Template.questionListStats.helpers({
    getTimestamp: function (date) {
        return date.getTime();
    },
    isOwner: function (id) {
        return Meteor.userId() === id;
    }
});