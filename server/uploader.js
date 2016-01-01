var exec = Npm.require('child_process').execSync;
var uploadDir = process.env.NODE_ENV === 'development' ? process.env.PWD + '/uploads' : '/uploads';
Meteor.startup(function () {
    //init code for upload-server package
    UploadServer.init({
        tmpDir: uploadDir + '/tmp',
        uploadDir: uploadDir,
        //uploadUrl: '/upload',
        checkCreateDirectories: true, //create the directories for you
        getDirectory: function (fileInfo, formData) {
            //depending on the purpose, we can route the files to different folders
            if (formData.purpose === 'JAR') {
                return 'questions/' + formData._id;
            }
            if (formData.purpose === 'JAVADOCS') {
                return 'javadocs/' + formData._id;
            }
            return undefined;
        },
        finished: function (fileInfo, formData) {
            console.log('Upload success: ' + fileInfo.path);
            if (process.env.NODE_ENV !== 'development' && formData.purpose === 'JAVADOCS') {
                exec('cd ' + uploadDir + '/' + fileInfo.subDirectory +'; find . \\! -name "' + fileInfo.name + '" -delete; unzip -uo ' + fileInfo.name);
                console.log('Unzip Complete: ' + fileInfo.path);
            }
            if (process.env.NODE_ENV === 'development' && formData.purpose === 'JAVADOCS') {

            }
        },
        overwrite: true,
        maxFileSize: 5000000 //5mb
    })
});

var fs = Npm.require('fs');
var exec = Npm.require('child_process').exec;
Meteor.methods({
    getFileNames: function (questionId) {
        try {
            var files = fs.readdirSync(uploadDir + '/questions/' + questionId);
            files = _.without(files,
                '.DS_Store'
            );
            return files;
        } catch (err) {
            //no such directory, just return empty array
            return [];
        }
    },
    getJavadocs: function (questionId) {
        try {
            var files = fs.readdirSync(uploadDir + '/javadocs/' + questionId);
            files = _.without(files,
                '.DS_Store'
            );
            return files;
        } catch (err) {
            //no such directory, just return empty array
            return [];
        }
    },
    removeQuestionDirectory: function (questionId) {
        exec('rm -rf ' + uploadDir + '/questions/' + questionId);
    }
});

StaticServer.add('/javadocs', uploadDir + '/javadocs');