AutoForm.hooks({
    insertQuestionForm: {
        onSuccess: function (formType, result) {
            Session.set('questionId', result);
            Router.go('testQuestion');
        }
    }
});