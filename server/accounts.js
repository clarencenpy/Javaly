// first, remove configuration entry in case service is already configured
ServiceConfiguration.configurations.remove({
    service: "google"
});

ServiceConfiguration.configurations.insert({
    service: "google",
    clientId: "1037060542206-u8po9ngeinnhqbv5agkrkrv0djslmakn.apps.googleusercontent.com",
    secret: "iCd_ySJR9Ix2Unl6RGRxSzQV"
});

Accounts.config({
    restrictCreationByEmailDomain: 'smu.edu.sg'
});


//automatically create student accounts
Accounts.onCreateUser(function (options, user) {
    if (user.services.google) {
        var givenName = user.services.google.given_name;
        var familyName = user.services.google.family_name;
        if (familyName === '_') {   //SMU default
            user.profile = {name: givenName};
        } else {
            user.profile = {name: givenName + ' ' + familyName};
        }
    }
    user.roles = ['student'];
    return user;
});