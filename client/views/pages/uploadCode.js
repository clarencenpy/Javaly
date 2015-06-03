Template.uploadCode.helpers({
    formData: function () {
        var userId = Session.get('questionId');
        Session.set('questionId', null);
        return { userId: Session.get('questionId') };
    }
});