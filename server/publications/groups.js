Meteor.publish('myGroups', function () {
    return Groups.find({createdBy: this.userId});
});

//TODO: should we do more checks to ensure that user has access to that group?
Meteor.publish('group', function (groupId) {
    return Groups.find(groupId);
});

Meteor.publishComposite('group-info', function (groupId) {
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
                    return Attempts.find({$and: [{questionId: {$in: questions}}, {userId: {$in: participants}}]});
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