Template.questionManager.helpers({
    authoredQuestions: function () {
        var questions = Questions.find({createdBy: Meteor.userId()}).fetch();

        //collate info for every question
        questions = _.map(questions, function (question) {
            var info = {};

            var attempts = Attempts.find({questionId: question._id}).fetch();
            var passedBefore = _.find(attempts, function (attempt) {   // _.find returns when a match has been found
                return attempt.completed;
            });

            info._id = question._id;
            info.title = question.title;
            info.createdAt = question.createdAt;
            info.passed = passedBefore ? true: false;

            return info;
        });

        return questions;
    },

    verifiedQuestions: function () {
        var questions = Questions.find().fetch();

        //remove unverified questions
        questions = _.filter(questions, function (question) {
            var attempts = Attempts.find({questionId: question._id}).fetch();
            var passedBefore = _.find(attempts, function (attempt) {   // _.find returns when a match has been found
                return attempt.completed;
            });
            return passedBefore ? true : false;
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