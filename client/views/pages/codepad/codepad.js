Template.codepad.helpers({
    compileResult: function () {
        return Session.get('compileResult');
    },

    compileError: function () {
        return Session.get('compileError');
    },
    compileResultOrError: function () {
        return Session.get('compileResult') || Session.get('compileError');
    },
    questionsToSuggest: function () {
        var currentQuestionId = this.questionId;
        var questions = Session.get('currentExercise') || [];
        questions = _.without(questions, currentQuestionId).map(function (questionId) {
            var question = Questions.findOne(questionId);
            var attempt = Attempts.findOne({questionId: questionId, userId: Meteor.userId()});
            return {
                completed: attempt ? attempt.completed : false,
                _id: question._id,
                title: question.title
            }
        });

        return questions;
    }
});
