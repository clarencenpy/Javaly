// Run this when the meteor app is started
Meteor.startup(function () {
    Meteor.call('compile', {
        classpath: '/Users/clarencenpy/IdeaProjects/Javaly/.meteor/local/cfs/files/javaFiles/',
        filepath: '/Users/clarencenpy/IdeaProjects/Javaly/.meteor/local/cfs/files/javaFiles/javaFiles-7uDoboMrrtdiDw3LA-Student.java'
    }, function (err, result) {
        if (err) {
            console.log(err.error);
            return;
        }
        console.log(result);
    });

    Meteor.call('run', {
        classpath: '/Users/clarencenpy/IdeaProjects/Javaly/.meteor/local/cfs/files/javaFiles/javaFiles-7uDoboMrrtdiDw3LA-Student.java',
        filepath: 'Test'
    }, function (err, result) {
        if (err) {
            console.log(err.error);
            return;
        }
        console.log(result);
    });

});