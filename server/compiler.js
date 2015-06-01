exec = Npm.require('child_process').exec;
execSync = Meteor.wrapAsync(exec);

Meteor.methods({
    compile: function (options) {
        var args = ['javac'];
        args.push('-cp');
        args.push(options.classpath);
        args.push(options.filepath)
        var cmd = args.join(' ');

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
        args.push(options.filepath)
        var cmd = args.join(' ');

        try {
            return execSync(cmd);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    }
});

