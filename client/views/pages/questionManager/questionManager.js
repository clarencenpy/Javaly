Template.questionManager.helpers({
    authoredQuestions: function () {
        return Questions.find({createdBy: Meteor.userId()}, {sort: {updatedAt: -1}});
    },

    verifiedQuestions: function () {
        var questions = Questions.find().fetch();

        //remove unverified questions
        questions = _.filter(questions, function (question) {
            return question.verified;
        });

        questions = _.map(questions, function (question) {
            var info = {};

            info._id = question._id;
            info.title = question.title;
            info.createdAt = question.createdAt;
            info.tags = question.tags;
            info.numAttempts = Attempts.find({questionId: question._id}).count();
            info.author = Meteor.users.findOne(question.createdBy).profile.name;

            return info;
        });

        return questions;
    }
});