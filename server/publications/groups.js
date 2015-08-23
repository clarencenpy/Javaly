Meteor.publish('myGroups', function () {
    return Groups.find({createdBy: this.userId});
});

Meteor.publishComposite('allGroups', {
    find: function () {
        return Groups.find();
    },
    children: [
        {
            find: function (topLevelDoc) {
                return Meteor.users.find({$or: [
                        {_id: topLevelDoc.createdBy},
                        {_id: {$in: topLevelDoc.teachingTeam}}
                    ]}, {fields: {'profile.name': 1}
                });
            }
        }
    ]
});

//Used in: joinGroups
Meteor.publishComposite('availableGroups', {
    find: function () {
        return Groups.find({groupType: {$in: ['OPEN', 'ACCEPT_REQUEST']}});
    },
    children: [
        {
            find: function (topLevelDoc) {
                return Meteor.users.find({$or: [
                    {_id: topLevelDoc.createdBy},
                    {_id: {$in: topLevelDoc.teachingTeam}}
                ]}, {fields: {'profile.name': 1}
                });
            }
        }
    ]
});

//TODO: should we do more checks to ensure that user has access to that group?
Meteor.publish('group', function (groupId) {
    return Groups.find(groupId);
});

Meteor.publishComposite('assignments', {
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
        return doc.createdBy === userId;
    },
    remove: function (userId, doc) {
        return doc.createdBy === userId;
    }
});

// Methods for managing exercises
Meteor.methods({
    updateExercise: function (description, questions, groupId, exerciseId) {
        //only the teaching team can update exercise
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }


        var group = Groups.findOne(groupId);
        var isTeachingTeam = _.find(group.teachingTeam, function (id) {
            return id === Meteor.userId();
        });
        if (group.createdBy !== Meteor.userId() && !isTeachingTeam) {
            throw new Meteor.Error(403, 'Access Denied');
        }

        Groups.update({_id: groupId, 'exercises._id': exerciseId}, {
            $set: {'exercises.$.description': description, 'exercises.$.questions': questions}
        });

    },

    deleteExercise: function (groupId, exerciseId) {
        //only the teaching team can update exercise
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        var group = Groups.findOne(groupId);
        var isTeachingTeam = _.find(group.teachingTeam, function (id) {
            return id === Meteor.userId();
        });
        if (group.createdBy !== Meteor.userId() && !isTeachingTeam) {
            throw new Meteor.Error(403, 'Access Denied');
        }

        Groups.update(groupId, {
            $pull: {'exercises': {_id: exerciseId}}
        });
    }
});

// Methods for managing participants in groups
Meteor.methods({
    requestJoinGroup: function (groupId) {
        //students can request to join groups
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        Groups.update(groupId, {
            $push: {
                pendingParticipants: Meteor.userId()
            }
        });
    },

    leaveGroup: function (groupId) {
        //students may leave group, TODO: send a notification to instructor
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        //this method can also be used to withdraw request
        Groups.update(groupId, {$pull: {
            participants: Meteor.userId(),
            pendingParticipants: Meteor.userId()
        }});
    },

    addStudentToGroup: function (userId, groupId) {
        //only members from the teaching team can accept requests
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        var group = Groups.findOne(groupId);
        var isTeachingTeam = _.find(group.teachingTeam, function (id) {
            return id === Meteor.userId();
        });
        if (group.createdBy !== Meteor.userId() && !isTeachingTeam) {
            throw new Meteor.Error(403, 'Access Denied');
        }

        //remove from pendingParticipants if present
        var pending = _.find(group.pendingParticipants, function (id) {
            return id === userId;
        });
        if (pending) {
            Groups.update(groupId, {$pull: {
                pendingParticipants: userId
            }});
        }

        //add to participants
        var alreadyAdded = _.find(group.participants, function (id) {
            return id === userId;
        });
        if (!alreadyAdded) {
            Groups.update(groupId, {$push: {
                participants: userId
            }});
        }
    }
});