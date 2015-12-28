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

Meteor.publish('questionBank', function () {
    return Questions.find();
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
                return Meteor.users.find(topLevelDoc.createdBy, {fields: {'profile.name': 1}});
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

Meteor.publish('allTags', function () {
    return Tags.find();
});

Meteor.methods({
    allContributors: function () {
        var ids = _.uniq(Questions.find({}, {fields: {createdBy: 1}, sort: {createdBy: 1}}).fetch().map(function (q) {
            return q.createdBy;
        }));
        return _.map(ids, function (id) {
            return {
                name: Meteor.users.findOne(id).profile.name,
                id: id
            }
        });
    }
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