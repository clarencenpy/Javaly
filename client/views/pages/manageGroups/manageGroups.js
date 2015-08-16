Template.manageGroups.onCreated(function () {
    this.subscribe('myGroups');
});

Template.manageGroups.helpers({
    myGroups: function () {
        return Groups.find({createdBy: Meteor.userId()});
    }
});

Template.manageGroups.events({
    'click .add-exercise-btn': function () {
        var groupId = this._id;
        var exerciseId = Random.id();

        swal({
            title: "Are you sure?",
            text: "You cannot delete an exercise after it is created (for now), as it might interrupt students already working on it.",
            type: "info",
            showCancelButton: true,
            confirmButtonText: "Proceed",
            cancelButtonText: "Cancel"
        }, function () {
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
            })
        });
    }
});