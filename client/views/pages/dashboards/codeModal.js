Template.codeModal.onCreated(function () {
    var template = this;
    template.autorun(function () {
        template.subscribe('codepad', Session.get('selectedAttempt'));
    })
});

Template.codeModal.helpers({
    attempt: function () {
        return Attempts.findOne(Session.get('selectedAttempt'));
    },
    getName: function (userId) {
        var user = Meteor.users.findOne(userId);
        return user ? user.profile.name : '';
    }
});