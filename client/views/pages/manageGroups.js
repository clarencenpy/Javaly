Template.manageGroups.onCreated(function () {
    this.subscribe('myGroups');
});

Template.manageGroups.helpers({
    myGroups: function () {
        return Groups.find({createdBy: Meteor.userId()});
    }
});