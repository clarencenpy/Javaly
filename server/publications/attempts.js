Meteor.publish('attempt', function (attemptId) {
    return Attempts.find(attemptId);
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