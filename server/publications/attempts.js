Meteor.publish('attempt', function (attemptId) {
    return Attempts.find(attemptId);
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