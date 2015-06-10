Template.uploadCode.helpers({
    formData: function () {
        return { questionId: Router.current().params.id };
    },

    uploadCallback: function () {
        return {
            finished: function (index, fileInfo, templateContext) {
                var attemptId = Attempts.insert({
                    userId: Meteor.userId(),
                    questionId: Router.current().params.id
                });

                var $proceedModal =  $('#proceedModal');
                $proceedModal.modal();
                $proceedModal.find('#proceed-btn').on('click', function () {
                    $proceedModal.modal('hide');    //the backdrop will only be hidden after the hide animation
                    Router.go('/codepad/' + attemptId);
                });
                $proceedModal.find('#nowNow-btn').on('click', function () {
                    $proceedModal.modal('hide');
                    Router.go('/');
                })


            }
        }
    }
});