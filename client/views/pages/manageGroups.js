Template.manageGroups.helpers({
    myGroups: function () {
        return Groups.find({createdBy: Meteor.userId()});
    }
})