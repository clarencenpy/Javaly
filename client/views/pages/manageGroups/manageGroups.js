Template.manageGroups.helpers({
    getName: function (id) {
        return Meteor.users.findOne(id).profile.name;
    }
});

Template.manageGroups.events({
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
                    createdAt: new Date()
                }
            }
        });

        Router.go('editExercise', {
            groupId: groupId,
            exerciseId: exerciseId
        });

    },
    'click .accept-btn': function (event, instance) {
        var id = this.toString();
        var groupId = $(event.target).data('groupid');
        Groups.update(groupId, {
            $pull: {
                pendingParticipants: id
            },
            $push: {
                participants: id
            }
        });
    },
    'click .reject-btn': function (event, instance) {
        var id = this.toString();
        var groupId = $(event.target).data('groupid');
        Groups.update(groupId, {
            $pull: {
                pendingParticipants: id
            }
        });
    }
});