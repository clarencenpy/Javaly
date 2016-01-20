Meteor.publishComposite('exerciseDashboard', function (groupId, exerciseId) {
    return {
        find: function () {
            return Groups.find(groupId);
        },
        children: [
            {
                //publishing Attempts with all possible combinations of userId-questionId
                find: function (group) {    //topLevelDoc
                    var exercise = _.find(group.exercises, function (exercise) {
                        return exerciseId === exercise._id;
                    });
                    var questions = exercise.questions;
                    var students = group.participants;
                    return Attempts.find({$and: [{questionId: {$in: questions}}, {userId: {$in: students}}]}, {fields: {
                        questionId: 1,
                        userId: 1,
                        totalActiveTime: 1,
                        completed: 1,
                        //'history.date': 1,
                        active: 1
                    }});
                }
            },
            {
                //publishing question titles
                find: function (group) {
                    var exercise = _.find(group.exercises, function (exercise) {
                        return exerciseId === exercise._id;
                    });
                    return Questions.find({_id: {$in: exercise.questions}}, {fields: {
                        title: 1
                    }});
                }
            },
            {
                //publish student info
                find: function (group) {
                    return Meteor.users.find({_id: {$in: group.participants}}, {fields: {
                        'profile.name': 1
                    }})
                }
            }
        ]
    }
});

Meteor.methods({
    history: function (attemptId) {
        return Attempts.findOne(attemptId, {fields: {
            history: 1
        }});
    }
});