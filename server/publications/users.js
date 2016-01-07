Meteor.publish('allUsers', function () {
    // publishing all users instead of by role, as performing a full search for users in role is expensive
    return Meteor.users.find({}, {fields: {
        profile: 1,
        emails: 1,
        roles: 1,
        'services.google.email': 1
    }});
});
