Template.codepadModal.helpers({
    questionId: function () {
        var attemptId = Template.currentData();
        return Attempts.findOne(attemptId) ? Attempts.findOne(attemptId).questionId : undefined;
    },
    student: function () {
        var attemptId = Template.currentData();
        var userId = Attempts.findOne(attemptId) ? Attempts.findOne(attemptId).userId : undefined;
        return Meteor.users.findOne(userId);
    }
});