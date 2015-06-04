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
                Router.go('/codepad/' + attemptId);
            }
        }
    }
});