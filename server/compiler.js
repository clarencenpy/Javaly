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

kue = Meteor.npmRequire('kue');
jobs = kue.createQueue({
    redis: {
        port: 6379,
        host: process.env.ROOT_URL === 'http://kuala.smu.edu.com' ? 'redis' : 'localhost'
    }
});

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

        // there are two ways of getting the test code now: 1)From DB as string 2)Test JSON

        var testJSON;

        if (question.testCode) {
            //do nothing for now
        } else if (question.testCases) {
            testJSON = {};
            testJSON.testCases = question.testCases;
            testJSON.questionType = question.questionType;
            testJSON.methodName = question.methodName;
            testJSON.classname = question.classname;
            testJSON.static = question.methodType === 'STATIC';
        } else {
            //both not present
            return {status: 'testNotDefined'};
        }

        var future = new Future();

        jobs.create('compileRun', {
            attemptId: options.attemptId,
            classname: question.classname,
            code: options.code,
            testJSON: testJSON,
            testCode: question.testCode
        })
        .on('complete', function (result) {
            console.log("Completed: " + (new Date() - start));
                console.log(result);
            future.return(result);
        })
        .on('failed', function (err) {
            console.log("Failed: " + (new Date() - start));
                console.log(err);
            future.return({isError: true, error: err});
        })
        .save();

        var result = future.wait();   //this is necessary for executing async code in a meteor method


        // ------ update mongodb based on results ------ //
        if(result.isError) {
            //uncompilable code - store result, then throw error to the UI
            //will have to decide in the future if i wanna store code that cannot compile to history
            Attempts.update(options.attemptId, {$set: {
                code: options.code,
                result: {error: result.error},
                activeTime: options.activeTime
            }});
            throw new Meteor.Error(result.error);
        }

        // ran succesfully
        if (result.success) {
            Attempts.update(options.attemptId, {$set: {
                code: options.code,
                result: result,
                activeTime: options.activeTime,
                completed: true     //completed will be true as long as question has been successful before
            }});
        } else {
            Attempts.update(options.attemptId, {$set: {
                code: options.code,
                result: result,
                activeTime: options.activeTime
            }});
        }

        return result;

    }

});

