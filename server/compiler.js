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
var Future = Npm.require("fibers/future");
exec = Npm.require('child_process').exec;
fs = Npm.require('fs');
execSync = Meteor.wrapAsync(exec);
writeFileSync = Meteor.wrapAsync(fs.writeFile);
readFileSync = Meteor.wrapAsync(fs.readFile);
//mkdirp = Npm.require('mkdirp');
//mkdirpSync = Meteor.wrapAsync(mkdirp);

kue = Meteor.npmRequire('kue');
jobs = kue.createQueue();

Meteor.methods({

    compileAndRun: function (options) {

        var start = new Date();
        console.log("Start: " + (new Date() - start));

        //  -------- fetch the docs ----------- //
        var attempt = Attempts.findOne(options.attemptId);
        var question = Questions.findOne(attempt.questionId);

        var currentCode = attempt.code;
        if (currentCode === options.code) {    //no changes to the code
            //do not attempt to rerun code and send {status: unchanged}
            console.log('no changes to code');
            return {status: 'unchanged'};
        }

        //  -------- add job ----------- //
        //TODO: should not even write test to file
        try {
            var test = readFileSync(process.env.PWD + '/uploads/questions/' + attempt.questionId + '/Test.java', {encoding: 'utf8'});
        } catch (err) {
            throw new Meteor.Error(err.message);
        }

        var future = new Future();

        jobs.create('compileRun', {
            attemptId: options.attemptId,
            classname: question.classname,
            code: options.code,
            test: test
        })
        .on('complete', function (result) {
            console.log("Completed: " + (new Date() - start));
            future.return(result);
        })
        .on('failed', function (err) {
            console.log("Failed: " + (new Date() - start));
            throw new Meteor.Error(err);
            //future.return(err);
        })
        .save();

        var result =  future.wait();   //this is necessary for executing async code in a meteor method


        // ------ update mongodb based on results ------ //

        Attempts.update(options.attemptId, {$set: {code: options.code, result: result, activeTime: options.activeTime}});

        return result;

    }

});

