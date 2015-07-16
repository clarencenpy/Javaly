Meteor.publishComposite('codepad', function (attemptId) {
    return {
        find: function () {
            return Attempts.find(attemptId);
        },
        children: [
            {
                //publish question
                find: function (topLevelDoc) {
                    return Questions.find(topLevelDoc.questionId);
                },
                children: [
                    {
                        //publish author name
                        find: function (secondLevelDoc, topLevelDoc) {
                            return Meteor.users.find(secondLevelDoc.createdBy, {fields: {
                                'profile.name': 1
                            }})
                        }
                    }
                ]
            }
        ]
    }
});

Meteor.publish('attemptFromQuestionId', function (questionId) {
   return Attempts.find({questionId: questionId, userId: this.userId});
});

Attempts.allow({
    insert: function (userId, doc) {
        return userId;
    }
});

Attempts.deny({
    update: function() {
        return true;
    },
    remove: function () {
        return true;
    }
});