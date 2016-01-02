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
        var attempt =  Attempts.findOne({questionId: questionId, userId: Meteor.userId()});
        if (attempt === undefined) {
            var attemptId = Attempts.insert({
                userId: Meteor.userId(),
                questionId: questionId
            });
            Router.go('codepad', {_id: attemptId});
        } else {
            Router.go('codepad', {_id: attempt._id});
        }
    }
});