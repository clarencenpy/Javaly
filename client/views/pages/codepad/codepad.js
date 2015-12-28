Template.codepad.onRendered(function () {
    // Toggle collapse of the sidebar
    toggleSidebar();
});

Template.codepad.onDestroyed(function () {
    toggleSidebar();
});

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
    showSolution: function (attempt) {
        if (attempt.completed || attempt.history ? attempt.history.length > 3 : false) {
            var question = Questions.findOne(attempt.questionId);
            return question.solution ? question.solution.release : false;
        }
    }
});
