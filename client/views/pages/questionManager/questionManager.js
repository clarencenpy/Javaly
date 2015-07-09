Template.questionManager.onCreated(function () {
   this.subscribe('myQuestions');
});

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
    }
});