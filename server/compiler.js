exec = Npm.require('child_process').exec;
fs = Npm.require('fs');
//mkdirp = Npm.require('mkdirp');

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
writeFileSync = Meteor.wrapAsync(fs.writeFile);
//mkdirpSync = Meteor.wrapAsync(mkdirp);

Meteor.methods({

    compileAndRun: function (options) {

        var attempt = Attempts.findOne(options.attemptId);
        var currentCode = attempt.code;
        if (currentCode !== options.code) {    //changes to the code
            Attempts.update(options.attemptId, {$set: {code: options.code}});
        }

        var question = Questions.findOne(attempt.questionId);

        //TODO: undo hardcoding
        //write the code into file
        var dir = process.env.PWD + '/uploads/attempts/' + options.attemptId;

        try {
            execSync('mkdir -p ' + dir); //TODO: there should be a better way instead of exec
        } catch (err) {
            throw new Meteor.Error(err.message);
        }

        var filepath = dir + '/' + question.classname + '.java';

        try {
            writeFileSync(filepath, options.code);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }


        //compile question dir against attempt dir
        var args = ['javac', '-cp'];
        args.push(dir);
        args.push(process.env.PWD + '/uploads/questions/' + attempt.questionId + '/Test.java');
        var cmd = args.join(' ');

        try {
            execSync(cmd);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }

        //run test
        args = ['java', '-cp'];
        args.push(dir + ':' + process.env.PWD + '/uploads/questions/' + attempt.questionId);
        args.push('Test');
        cmd = args.join(' ');

        try {
            return execSync(cmd);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    }


});
