Meteor.publish('myGroups', function () {
    return Groups.find({createdBy: this.userId});
});

//TODO: should we do more checks to ensure that user has access to that group?
Meteor.publish('group', function (groupId) {
    return Groups.find(groupId);
});

Meteor.publishComposite('enrolledGroups', {
    find: function() {
        return Groups.find({participants: this.userId});
    },
    children: [
        {
            //publishing all the questions the student should have access to
            find: function (topLevelDoc) {
                var questions = [];
                _.each(topLevelDoc.exercises, function (exercise) {
                    questions = questions.concat(exercise.questions);
                });
                return Questions.find({_id: {$in: questions}}, {fields: {
                    title: 1
                }});
            },
            children: [
                {
                    //for each question, publish all the attempts
                    find: function (secondLevelDoc, topLevelDoc) {
                        return Attempts.find({questionId: secondLevelDoc._id, userId: this.userId}, {fields: {
                            questionId: 1,
                            userId: 1,
                            completed: 1,
                            history: {$slice: -1}, //return only the history of the most recent attempt (to get lastAttempt date)
                            'history.date': 1
                        }});
                    }
                }
            ]
        }
    ]

});

Meteor.publishComposite('groupInfo', function (groupId) {
    return {
        find: function () {
            return Groups.find(groupId);
        },
        children: [
            {
                //publishing Attempts with all possible combinations of userId-questionId
                find: function (topLevelDoc) {
                    var questions = []; //all the questions used in all exercises
                    _.each(topLevelDoc.exercises, function (exercise) {
                        questions = questions.concat(exercise.questions);
                    });
                    var participants = topLevelDoc.participants;
                    return Attempts.find({$and: [{questionId: {$in: questions}}, {userId: {$in: participants}}]}, {fields: {
                        questionId: 1,
                        userId: 1,
                        totalActiveTime: 1,
                        completed: 1,
                        'history.date': 1
                    }});
                }
            },
            {
                //publishing Questions
                find: function (topLevelDoc) {
                    var questions = [];
                    _.each(topLevelDoc.exercises, function (exercise) {
                        questions = questions.concat(exercise.questions);
                    });
                    return Questions.find({_id: {$in: questions}}, {fields: {
                        title: 1
                    }});
                }
            },
            {
                //publishing User info
                find: function (topLevelDoc) {
                    return Meteor.users.find({_id: {$in: topLevelDoc.participants}}, {fields: {
                        'profile.name': 1,
                        emails: 1
                    }})
                }
            }
        ]
    }
});

Groups.allow({
    insert: function (userId, doc) {
        return userId && Roles.userIsInRole(userId, ['instructor','admin']);
    },
    update: function (userId, doc) {
        //TODO: uncomment this line after beta
        //return doc.createdBy === userId;
        return true;
    },
    remove: function (userId, doc) {
        return doc.createdBy === userId;
    }
});

Meteor.methods({
    updateExercise: function (description, questions, groupId, exerciseId) {
        Groups.update({_id: groupId, 'exercises._id': exerciseId}, {
            $set: {'exercises.$.description': description, 'exercises.$.questions': questions}
        })
    }
});

Meteor.publish('betaGroups', function () {
   return Groups.find();
});