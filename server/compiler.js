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
        host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
    }
});

Meteor.methods({

    compileAndRun: function (options) {

        var start = new Date();

        //  -------- fetch the docs ----------- //
        var attempt = Attempts.findOne(options.attemptId);
        var question = Questions.findOne(attempt.questionId);

        //prevent users from trying to compile exactly the same code
        //var currentCode = attempt.code;
        //if (currentCode === options.code) {    //no changes to the code
        //    //do not attempt to rerun code and send {status: unchanged}
        //    console.log('no changes to code');
        //    return {status: 'unchanged'};
        //}

        //  -------- add job ----------- //

        var job = {};

        //decide whether or not to specify questionId
        if (Meteor.call('getFileNames', question._id).length > 0) {     //there are files uploaded
            job.questionId = question._id;
        }

        //generate source code
        if (question.classname) {
            job.sourceCode = options.code;
            job.sourceClassname = question.classname;
        } else {
            job.sourceCode = question.classname ? options.code : injectMethodBody(options.code);
            job.sourceClassname = 'MethodHolder';
        }

        // generate test code from either: 1)Fully defined 2)Test JSON from UI
        if (question.testCode) {
            job.testCode = question.testCode;
            job.testClassname = 'StagingMethodTest';
        } else if (question.testCases && question.questionType && question.methodName && question.methodType) {   //all required fields available

            job.testCode = generateTestCode({
                questionType: question.questionType,
                methodName: question.methodName,
                static: question.methodType === 'STATIC',
                classname: question.classname,
                testCases: question.testCases
            });
            job.testClassname = 'StagingMethodTest';

        } else {
            //both not present
            return {status: 'testNotDefined'};
        }

        var future = new Future();

        jobs.create('compileRun', job)
        .on('complete', function (result) {
            console.log("Compile request for QID " + question._id +  ": Complete (" + (new Date() - start) + "ms)");
                //console.log(result);
            future.return(result);
        })
        .on('failed', function (err) {
            console.log("Compile request for QID " + question._id +  ": Failed (" + (new Date() - start) + "ms)");
                //console.log(err);
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
                status: 'COMPILE_ERROR',
                activeTime: options.activeTime
            }});
            throw new Meteor.Error(result.error);
        }

        // ran succesfully
        if (result.success) {
            Attempts.update(options.attemptId, {$set: {
                code: options.code,
                status: 'PASS',
                activeTime: options.activeTime,
                completed: true     //completed will be true as long as question has been successful before
            }});
            Questions.update(question._id, {$set: {verified: true}}); //once there is a successful attempt, question will become verified
        } else {
            Attempts.update(options.attemptId, {$set: {
                code: options.code,
                status: 'FAIL',
                activeTime: options.activeTime
            }});
        }

        return result;

    }

});


//Functions to generate tester code from json

var INSERTION_HASH = 'e35089b2d968d2c00562279dd210847f3e156caa7c9affbaa45a25c6c0e75edf'; //SHA-256 of ILoveJava
var injectMethodBody = function (methodBody) {
    var fileContents = 'import java.io.*;import java.util.*; public class MethodHolder{ ' + INSERTION_HASH +' }';
    return fileContents.replace(INSERTION_HASH, methodBody);
};

var generateTestCode = function (test) {

    var fileContents = 'import static javaly.core.Test.*;import javaly.core.*;import java.util.*;public class StagingMethodTest{ ' + INSERTION_HASH + ' }';
    var statements = '';
    var count = 0;

    test.testCases.forEach(function(testCase) {
        //construct statement
        statements += buildStatement(testCase, test.questionType, test.methodName, test.static, test.classname, count);
        count++;
    });

    return fileContents.replace(INSERTION_HASH, statements);
};

var buildStatement = function(testCase, questionType, methodName, isStatic, classname, count) {
    var statement = '';
    var methodInvoker = '';

    if (isStatic){
        methodInvoker = classname ? classname + '.' : 'MethodHolder.';
    } else {
        methodInvoker = classname ? 'new ' + classname + '().' : 'new MethodHolder().';
    }

    //prepare the variables
    var prepCode = testCase.prepCode ? testCase.prepCode : '';
    var visibleCode = testCase.visible ? '' : ', hidden=true';
    var description = testCase.description ? '"' + testCase.description + '", ' : '';
    var input = testCase.input ? testCase.input : '';
    var output = testCase.output;
    if (output.search(/".+"/) === -1) { //if no quotes
        output = '"' + output + '"';    //add the quotes
    }
    //replace all the newlines with literals to handle multiline output
    output = output.split('\n').join('\\n');
    description = description.split('\n').join('\\n');

    if (questionType === 'RETURN'){
        /*
         Structure:
         @TestCase (expectedOutput="output")
         public void test<count>(){
         assertEquals(description, output, new MethodHolder().methodName(input));
         }
         */

        statement = '@TestCase (expectedOutput=' + output + visibleCode + ')' +
            'public void test' + count + '(){' +
            prepCode +
            'assertEquals(' + description  + testCase.output + ', ' + methodInvoker + methodName + '(' + input + '));' +
            '}';

    } else if (questionType === 'SYSTEM_OUT') {
        /*
         Structure:
         @TestCase (expectedOutput="output")
         public void test<count>(){
         new MethodHolder.methodName(params);
         assertEquals(description, output, retrieveSystemOutput());
         }
         */

        //automatically surround output with quotes for sysout questions

        statement = '@TestCase (expectedOutput=' + output + visibleCode +  ')' +
            'public void test' + count + '(){' +
            prepCode +
            methodInvoker + methodName + '(' + input + ');' +
            'assertEquals(' + description + output + ', retrieveSystemOutput());' +
            '}';
    } else {
        //shouldn't happen
    }

    return statement;
};
