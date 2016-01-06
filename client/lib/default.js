// Run this when the meteor app is started
Meteor.startup(function () {
    ifvisible.setIdleDuration(20); // Page will become idle after 120 seconds
});