Template.manageGroups.helpers({
    getName: function (id) {
        return Meteor.users.findOne(id).profile.name;
    },
    isCreator: function () {
        return Roles.userIsInRole(Meteor.userId(), ['admin']) || Template.currentData().createdBy === Meteor.userId();
    }
});

Template.manageGroups.events({
    'click .toggle-visibility-btn': function (event) {
        var groupId = $(event.currentTarget).data('groupid');
        Meteor.call('setExerciseVisibility', groupId ,this._id, !this.show);
    },
    'click .add-exercise-btn': function () {
        var groupId = this._id;
        var exerciseId = Random.id();

        //create a new exercise before redirecting to exercise builder

        Groups.update({_id: groupId}, {
            $push: {
                exercises: {
                    _id: exerciseId,
                    description: "",
                    questions: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    show: false
                }
            }
        });

        Router.go('exerciseBuilder', {
            groupId: groupId,
            exerciseId: exerciseId
        });

    },
    'click .accept-btn': function (event, instance) {
        var userId = this.toString();
        var groupId = $(event.target).data('groupid');
        Meteor.call('addStudentToGroup', userId, groupId);
    },
    'click .reject-btn': function (event, instance) {
        var userId = this.toString();
        var groupId = $(event.target).data('groupid');
        Meteor.call('rejectRequest', userId, groupId);
    }
});