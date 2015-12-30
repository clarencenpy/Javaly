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

Meteor.publishComposite('allQuestions', {
    find: function () {
       return Questions.find({}, {fields: {
           title: 1,
           tags: 1,
           createdBy: 1,
           createdAt: 1,
           updatedAt: 1
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

Meteor.publish('questionTitles', function () {
    return Questions.find({}, {fields: {title: 1}});
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
    },
    searchQuestions: function (searchParams) {
        var params = {};
        if (searchParams.title) {
            params.title = {
                $regex: searchParams.title,
                $options: 'ix'
            }
        }
        if (searchParams.tags) {
            params.tags = {
                $all: searchParams.tags
            }
        }
        if (searchParams.author) {
            params.createdBy = searchParams.author
        }
        return Questions.find(params, {sort: {createdAt: 1}, limit: searchParams.limit }).fetch().map(function (q) {
            return {
                _id: q._id,
                title: q.title,
                author: Meteor.users.findOne(q.createdBy).profile.name,
                content: q.content,
                popularity: Attempts.find({questionId: q._id}).count(),
                tags: q.tags.map(function (tag) {
                    return Tags.findOne(tag).label;
                })
            };
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

Tags.allow({
    insert: function (userId) {
        return userId && Roles.userIsInRole(userId, ['instructor','ta','admin']);
    },
    update: function (userId) {
        return userId && Roles.userIsInRole(userId, ['instructor','ta','admin']);
    }
});