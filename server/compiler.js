exec = Npm.require('child_process').exec;
/*
    == Fibers and Async ==
    We are unable to use async functions from npm straight, as the results are delivered
    through a callback. But this means that the meteor method is unable to return
    the results from the callback.
    Meteor provides an abstraction over some boilerplate we have to write involving
    the use of fibers. Find out more here: https://www.eventedmind.com/feed/nodejs-introducing-fibers

    Limitation: the callback should only take (err, result) as arguments.
    But thankfully we don't need the 3rd argument, stderr here.

    If we really need to access the other arguments, we can create another wrapper.

    execWrapper = function (cmd, callback) {
        this.exec(cmd, function(err, stdout, stderr) {
            var data = {stderr: stderr, stdout: stdout};
            callback(err, data);
        })
    };

 */
execSync = Meteor.wrapAsync(exec);

Meteor.methods({
    compile: function (options) {
        var args = ['javac'];
        args.push('-cp');
        args.push(options.classpath);
        args.push(options.filepath);
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
        args.push(options.filepath);
        var cmd = args.join(' ');

        try {
            return execSync(cmd);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    }
});

