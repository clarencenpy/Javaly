AutoForm.hooks({
    insertQuestionForm: {
        onSuccess: function (formType, result) {
            Router.go('uploadCode/' + result); //result is the questionId
            //TODO: route needs time to be detected
        }
    }
});