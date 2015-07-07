AutoForm.hooks({
    insertQuestionForm: {
        onSuccess: function (formType, result) {
            // result is the questionId

            //Add listeners with jquery instead of template.events() so we can have access to the result
            var $proceedModal =  $('#proceedModal');
            $proceedModal.modal();
            $proceedModal.find('#proceed-btn').on('click', function () {
                $proceedModal.modal('hide');    //the backdrop will only be hidden after the hide animation
                Router.go('uploadCode', {id: result});
            });
            $proceedModal.find('#nowNow-btn').on('click', function () {
                $proceedModal.modal('hide');
                Router.go('/');
            })

        }
    }
});
