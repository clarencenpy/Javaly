Meteor.publish('questions', function () {
    if (Roles.userIsInRole(this.userId, ['instructor','admin'])) {

        return Questions.find();

    } else {

        return Questions.find({$or: [
            {checked: true},
            {createdBy: this.userId}
        ]});

    }
});

Meteor.publish('question', function (questionId) {
    return Questions.find(questionId);
});

Questions.allow({
    insert: function (userId, doc) {
        return userId;
    },
    update: function (userId, doc) {
        return doc.createdBy === userId;
    },
    remove: function (userId, doc) {
        return doc.createdBy === userId;
    }
});