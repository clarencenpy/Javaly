Template.exerciseListing.onCreated(function () {

    var instance = this;
    instance.completedPercentage = new ReactiveVar();
    instance.attemptedButNotCompletedPercentage = new ReactiveVar();

    this.autorun(function () {
        var exercise = instance.data;
        var group = Template.parentData(1);
        var completed = 0;
        var attempted = 0;
        var verifiedQuestions = [];
        _.each(group.participants, function (userId) {
            //TODO: remove after beta, becase there will not be unverified questions in a group
            verifiedQuestions = exercise.questions;
            //remove unverified questions
            verifiedQuestions = _.filter(verifiedQuestions, function (question) {
                var attempts = Attempts.find({questionId: question}).fetch();
                var passedBefore = _.find(attempts, function (attempt) {   // _.find returns when a match has been found
                    return attempt.completed;
                });
                return passedBefore ? true : false;
            });
            console.log(verifiedQuestions);
            _.each(verifiedQuestions, function (questionId) {
                var attempt = Attempts.findOne({userId: userId, questionId: questionId});
                if (attempt && attempt.history) {  //have attempted before
                    attempted++;
                    if (attempt.completed){
                        completed++;
                    }
                }
            });
        });

        //var total = group.participants.length * exercise.questions.length;
        var total = group.participants.length * verifiedQuestions.length;
        instance.completedPercentage.set(Math.round(completed/total*100));
        instance.attemptedButNotCompletedPercentage.set(Math.round((attempted-completed)/total*100));

    });
});



Template.exerciseListing.helpers({
    completedPercentage: function () {
        return Template.instance().completedPercentage.get();
    },
    attemptedButNotCompletedPercentage: function () {
        return Template.instance().attemptedButNotCompletedPercentage.get();
    },

    verifiedQuestions: function () {
        var questions = this.questions;

        //remove unverified questions
        questions = _.filter(questions, function (question) {
            var attempts = Attempts.find({questionId: question}).fetch();
            var passedBefore = _.find(attempts, function (attempt) {   // _.find returns when a match has been found
                return attempt.completed;
            });
            return passedBefore ? true : false;
        });
        return questions;
    }
});