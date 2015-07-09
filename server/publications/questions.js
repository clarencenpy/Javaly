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

Meteor.publish('question-tags', function () {
   return Questions.find({}, {fields: {tags: 1}});
});

Meteor.publishComposite('myQuestions', {
    find: function () {
        return Questions.find({createdBy: this.userId});
    },
    children: [
        {
            find: function (topLevelDoc) {
                return Attempts.find({questionId: topLevelDoc._id}, {fields: {
                    questionId: 1,
                    userId: 1,
                    completed: 1
                }});
            }
        }
    ]
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