Template.exerciseListing.onCreated(function () {

    var instance = this;

    //TODO: remove after beta, because there will not be unverified questions in a group
    instance.verifiedQuestions = new ReactiveVar();
    var exercise = instance.data;
    var verifiedQuestions = exercise.questions;
    //remove unverified questions
    verifiedQuestions = _.filter(verifiedQuestions, function (question) {
        var attempts = Attempts.find({questionId: question}).fetch();
        var passedBefore = _.find(attempts, function (attempt) {   // _.find returns when a match has been found
            return attempt.completed;
        });
        return passedBefore ? true : false;
    });
    instance.verifiedQuestions.set(verifiedQuestions);

    instance.completedPercentage = new ReactiveVar();
    instance.attemptedButNotCompletedPercentage = new ReactiveVar();

    instance.questionsAsHeaders = new ReactiveVar(true);

    this.autorun(function () {
        var exercise = instance.data;
        var group = Template.parentData(1);
        var completed = 0;
        var attempted = 0;

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

Template.exerciseListing.onRendered(function () {
    this.$('[data-toggle=tooltip]').tooltip({
        container: 'body'
    });
});

Template.exerciseListing.helpers({
    completedPercentage: function () {
        return Template.instance().completedPercentage.get();
    },
    attemptedButNotCompletedPercentage: function () {
        return Template.instance().attemptedButNotCompletedPercentage.get();
    },

    //for toggling axes of summary view
    questionsAsHeaders: function () {
        return Template.instance().questionsAsHeaders.get();
    },

    verifiedQuestions: function () {
        return Template.instance().verifiedQuestions.get();
    },

    participantNames: function () {
        var group = Template.parentData(1);
        return _.map(group.participants, function (userId) {
            return Meteor.users.findOne(userId).profile.name;
        })
    },

    questionTitles: function () {

        var verifiedQuestions = Template.instance().verifiedQuestions.get();

        var i = 1;
        return _.map(verifiedQuestions, function (questionId) {
            return {
                index: i++,
                title: Questions.findOne(questionId).title
            };
        });
    },

    questionSummaryQuestionHeaders: function () {
        var group = Template.parentData(1);

        var verifiedQuestions = Template.instance().verifiedQuestions.get();

        var summary = _.map(group.participants, function (userId) {
            var row = {};
            row.name = Meteor.users.findOne(userId).profile.name;
            row.questions = [];
            _.each(verifiedQuestions, function (questionId) {
                var attempt = Attempts.findOne({userId: userId, questionId: questionId});
                row.questions.push({
                    completed: attempt ? attempt.completed : false,
                    attempted: attempt
                });
            });
            return row;
        });

        return summary;
    },

    questionSummaryStudentHeaders: function () {  //returns a 2d array containing the complete status, row=question, col=user
        var group = Template.parentData(1);

        var verifiedQuestions = Template.instance().verifiedQuestions.get();

        var summary = _.map(verifiedQuestions, function (questionId) {
            var row = {};
            row.title = Questions.findOne(questionId).title;
            row.participants = [];
            _.each(group.participants, function (userId) {
                var attempt = Attempts.findOne({userId: userId, questionId: questionId});
                row.participants.push({
                    completed: attempt ? attempt.completed : false,
                    attempted: attempt
                });
            });
            return row;
        });

        return summary;
        //summary: [
        //     row: { {title: XX} participants: [ {completed: true},{complete: false} ]},
        //     row: { {title: XX} participants: [ {completed: true},{complete: false} ]},
        //]
    }
});

Template.exerciseListing.events({
   'click #toggleAxes-btn': function (event, template) {
       template.questionsAsHeaders.set(!template.questionsAsHeaders.get());
   }
});