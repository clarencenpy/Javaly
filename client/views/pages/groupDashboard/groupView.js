Template.groupView.helpers({
    selectedAttempt: function () {
        return Session.get('selectedAttempt');
    }
});

Template.groupView.onDestroyed(function () {
    Session.set('selectedAttempt', null);
});