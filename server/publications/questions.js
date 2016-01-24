Meteor.publish('question', function (questionId) {
    return Questions.find(questionId);
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
    hasContributedQuestions: function (id) {
        return Questions.find({createdBy: id}).count() > 0;
    },
    searchQuestions: function (searchParams) {
        var params = {};
        var modifiers = {
            sort: {updatedAt: -1},
            limit: searchParams.limit,
            fields: {}
        };
        if (searchParams.title) {
            if (searchParams.title.length !== 0) {
                params.title = {
                    $regex: searchParams.title,
                    $options: 'ix'
                }
            }
        }
        if (searchParams.tags) {
            params.tags = {
                $all: searchParams.tags
            }
        }
        if (searchParams.author) {
            if (searchParams.author.length !== 0) {
                params.createdBy = searchParams.author;
            }
        }
        if (searchParams.excludeUnverified) {
            params.verified = true;
        }
        if (searchParams.excludeContent) {
            modifiers.fields.content = false;
        }

        return Questions.find(params, modifiers).fetch().map(function (q) {
            return {
                _id: q._id,
                title: q.title,
                author: Meteor.users.findOne(q.createdBy).profile.name,
                createdBy: q.createdBy,
                updatedAt: q.updatedAt,
                content: q.content,
                verified: q.verified,
                numAttempts: Attempts.find({questionId: q._id}).count(),
                tags: _.map(q.tags, function (tag) {
                    return Tags.findOne(tag).label;
                })
            };
        });
    },

    getAttemptId: function (questionId, userId) {
        var attempt = Attempts.findOne({questionId: questionId, userId: userId}, {sort: {updatedAt: -1}});
        return attempt ? attempt._id : undefined;
    }
});

Questions.allow({
    insert: function (userId, doc) {
        return userId;
    },
    update: function (userId, doc) {
        return Roles.userIsInRole(userId, ['admin']) || doc.createdBy === userId;
    },
    remove: function (userId, doc) {
        return Roles.userIsInRole(userId, ['admin']) || doc.createdBy === userId;
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