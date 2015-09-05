Template.suggestedQuestions.helpers({
    questionsToSuggest: function () {
        var currentQuestionId = this.questionId;
        var questions = Session.get('currentExercise') || [];
        questions = _.reduce(questions, function (memo, questionId) {
            var attempt = Attempts.findOne({questionId: questionId, userId: Meteor.userId()});
            var question = Questions.findOne(questionId);
            if (questionId === currentQuestionId) {
                return memo;
            }
            if (!attempt) {
                memo.push({
                    questionId: questionId, //required when we click the start button
                    title: question.title,
                    lastAttempted: undefined,
                    attemptId: undefined,
                    completed: false
                });
            } else {
                memo.push({
                    questionId: questionId, //required when we click the start button
                    title: question.title,
                    lastAttempted: attempt.history ? attempt.history[0].date: undefined, //since only the last attempt is published
                    attemptId: attempt._id,
                    completed: attempt.completed
                });
            }

            return memo;
        }, []);
        return questions;
    }
});

Template.suggestedQuestions.events({
    'click .start-btn': function () {
        var questionId = this.questionId;
        //check if previous attempt exists
        var attempt =  Attempts.findOne({questionId: questionId, userId: Meteor.userId()});
        if (attempt === undefined) {
            var attemptId = Attempts.insert({
                userId: Meteor.userId(),
                questionId: questionId
            });
            Router.go('codepad', {id: attemptId});
        } else {
            Router.go('codepad', {id: attempt._id});
        }
    }
});