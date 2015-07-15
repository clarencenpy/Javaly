Template.exerciseListing.onCreated(function () {

    var instance = this;
    instance.completedPercentage = new ReactiveVar();
    instance.attemptedButNotCompletedPercentage = new ReactiveVar();

    this.autorun(function () {
        var exercise = instance.data;
        var group = Template.parentData(1);
        var completed = 0;
        var attempted = 0;

        //TODO: remove after beta, becase there will not be unverified questions in a group
        var verifiedQuestions = exercise.questions;
        //remove unverified questions
        verifiedQuestions = _.filter(verifiedQuestions, function (question) {
            var attempts = Attempts.find({questionId: question}).fetch();
            var passedBefore = _.find(attempts, function (attempt) {   // _.find returns when a match has been found
                return attempt.completed;
            });
            return passedBefore ? true : false;
        });

        _.each(verifiedQuestions, function (questionId) {
            _.each(group.participants, function (userId) {
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
    },

    participantNames: function () {
        var group = Template.parentData(1);
        return _.map(group.participants, function (userId) {
            return Meteor.users.findOne(userId).profile.name;
        })
    },

    questionSummary: function () {  //returns a 2d array containing the complete status, row=question, col=user
        var group = Template.parentData(1);

        var verifiedQuestions = this.questions;
        verifiedQuestions = _.filter(verifiedQuestions, function (question) {
            var attempts = Attempts.find({questionId: question}).fetch();
            var passedBefore = _.find(attempts, function (attempt) {   // _.find returns when a match has been found
                return attempt.completed;
            });
            return passedBefore ? true : false;
        });

        var summary = _.map(verifiedQuestions, function (questionId) {
            var row = {};
            row.title = Questions.findOne(questionId).title;
            row.participants = [];
            _.each(group.participants, function (userId) {
                var attempt = Attempts.findOne({userId: userId, questionId: questionId});
                row.participants.push({completed: attempt ? attempt.completed : false});
            });
            return row;
        });

        return summary;
        //summary: [
        //     row: { {title: XX} questions: [ {completed: true},{complete: false} ]},
        //     row: { {title: XX} questions: [ {completed: true},{complete: false} ]},
        //]
    }
});