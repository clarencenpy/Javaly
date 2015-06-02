exec = Npm.require('child_process').exec;
execSync = Meteor.wrapAsync(exec);
pause = function pausecomp(millis) {
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
};

Meteor.methods({
    compile: function (options) {
        var args = ['javac'];
        args.push('-cp');
        args.push(options.classpath);
        args.push(options.filepath);
        var cmd = 'sleep 5; ' + args.join(' ');

        try {
            execSync(cmd);
            return {success: true};
        } catch (err) {
            throw new Meteor.Error(err.message);
        }

    },

    run: function (options) {
        var args = ['java'];
        args.push('-cp');
        args.push(options.classpath);
        args.push(options.filepath);
        var cmd = 'sleep 1; ' + args.join(' ');

        try {
            return execSync(cmd);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    }
});

