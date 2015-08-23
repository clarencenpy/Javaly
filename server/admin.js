// Methods for admin usage only

Meteor.methods({
    addUser: function (email, name, password, roles) {
        var loggedInUserId = Meteor.userId();
        if (!loggedInUserId || !Roles.userIsInRole(loggedInUserId, ['admin'])) {
            throw new Meteor.Error(403, 'Access denied');
        }

        var id;

        id = Accounts.createUser({
            email: email,
            password: password,
            profile: {name: name}
        });


        Roles.setUserRoles(id, roles);

        console.log('new user added: ' + id);
        return id;
    },

    toggleRole: function (userId, role) {
        var loggedInUserId = Meteor.userId();
        if (!loggedInUserId || !Roles.userIsInRole(loggedInUserId, ['admin'])) {
            throw new Meteor.Error(403, 'Access denied');
        }

        if (Roles.userIsInRole(userId, role)) {
            Roles.removeUsersFromRoles(userId, role);
        } else {
            Roles.addUsersToRoles(userId, role);
        }
    }

});


// Publish data for admin

Meteor.publish('admin', function () {

});