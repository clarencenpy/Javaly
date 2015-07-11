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

Meteor.publishComposite('allQuestions', {
    find: function () {
       return Questions.find({}, {fields: {
           title: 1,
           tags: 1,
           createdBy: 1,
           createdAt: 1
       }});
    },
    children: [
        {
            // Publish Author's name
            find: function (topLevelDoc) {
                return Meteor.users.find(topLevelDoc._id, {fields: {'profile.name': 1}});
            }
        },
        {
            // Publish related attempts
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