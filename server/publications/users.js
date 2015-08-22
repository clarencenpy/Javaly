Meteor.publish('allUsers', function () {
    if (Roles.userIsInRole(this.userId, ['admin', 'instructor'])) {
        // publishing all users instead of by role, as performing a full search for users in role is expensive
        return Meteor.users.find({}, {fields: {
            profile: 1,
            emails: 1,
            roles: 1
        }});
    } else {
        this.stop();
    }
});
