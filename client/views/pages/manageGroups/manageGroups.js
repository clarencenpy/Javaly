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
        Groups.update({_id: groupId}, {$push: {
            exercises: {
                _id: exerciseId,
                description: "",
                questions: [],
                createdAt: new Date()
            }
        }});

        Router.go('editExercise', {
            groupId: groupId,
            exerciseId: exerciseId
        })
    }
});