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

Template.submitQuestion.onCreated(function () {
   this.subscribe('question-tags');
});

Template.submitQuestion.onRendered(function () {
    var tagsField = this.$('.autoform-tags-field');

    //override their css
    tagsField.find('.bootstrap-tagsinput').addClass('form-control');

    //fix for bug that causes half typed text to remain even after autocomplete!
    tagsField.on('itemAdded', function () {
        $(this).find('.bootstrap-tagsinput>input').val('');
    });
});
