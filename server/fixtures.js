if(Meteor.users.find().count() === 0) {
    //creating users
    var users = [
        {name:"Yeow Leong", email:"yllee@smu.com", roles:['instructor']},
        {name:"Student1", email:"student1@smu.com", roles:['student']},
        {name:"Student2", email:"student2@smu.com", roles:['student']},
        {name:"Student3", email:"student3@smu.com", roles:['student']}
    ];

    _.each(users, function (user) {
        var id;

        id = Accounts.createUser({
            email: user.email,
            password: "password",
            profile: { name: user.name }
        });

        if (user.roles.length > 0) {
            // Need _id of existing user record so this call must come
            // after `Accounts.createUser` or `Accounts.onCreate`
            Roles.addUsersToRoles(id, user.roles);
        }

    });

}