Template.questionListStats.helpers({
    getTimestamp: function (date) {
        return date.getTime();
    },
    isOwner: function (id) {
        return Roles.userIsInRole(Meteor.userId(), ['admin']) || Meteor.userId() === id;
    }
});

Template.questionListStats.events({
    'click .goto-question-btn': function (event, instance) {
        var questionId = this._id;
        //check if previous attempt exists
        Meteor.call('getAttemptId', questionId, Meteor.userId(), function (err, res) {
            if (res) {  //id
                Router.go('codepad', {_id: res});
            } else {
                var attemptId = Attempts.insert({
                    userId: Meteor.userId(),
                    questionId: questionId
                });
                Router.go('codepad', {_id: attemptId});
            }
        });
    }
});