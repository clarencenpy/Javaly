Template.questionListStats.helpers({
    getTimestamp: function (date) {
        return date.getTime();
    },
    isOwner: function (id) {
        return Roles.userIsInRole(Meteor.userId(), ['admin']) || Meteor.userId() === id;
    }
});