Template.joinGroups.helpers({
    groups: function () {
        return Groups.find({
            participants: {$not: Meteor.userId()},
            pendingParticipants: {$not: Meteor.userId()}
        });
    },
    getName: function (id) {
        return Meteor.users.findOne(id).profile.name;
    },
    enrolledGroups: function () {
        return Groups.find({participants: Meteor.userId()});
    },
    pendingGroups: function () {
        return Groups.find({pendingParticipants: Meteor.userId()});
    },
    pendingAndEnrolledGroups: function () {
        return Groups.find({$or: [
            {participants: Meteor.userId()},
            {pendingParticipants: Meteor.userId()}
        ]});
    }
});

Template.joinGroups.onRendered(function () {

});

Template.joinGroups.events({
    'click #join-btn': function () {
        Meteor.call('requestJoinGroup', this._id, function (err, res) {
            if (err) console.log(err);
        })
    },
    'click #leave-btn': function () {
        Meteor.call('leaveGroup', this._id, function (err, res) {
            if (err) console.log(err);
        })
    }
});