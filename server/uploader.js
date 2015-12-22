var uploadDir = process.env.NODE_ENV === 'development' ? process.env.PWD + '/uploads' : '/mnt/javaly/uploads';

Meteor.startup(function () {

    //init code for upload-server package
    UploadServer.init({
        tmpDir: uploadDir + '/tmp',
        uploadDir: uploadDir,
        checkCreateDirectories: true, //create the directories for you
        getDirectory: function (fileInfo, formData) {
            //depending on the purpose, we can route the files to different folders
            if (formData.purpose === 'JAR') {
                return 'questions/' + formData._id;
            }
            return undefined;
        },
        finished: function (fileInfo) {
            console.log('Upload success: ' + fileInfo.path);
        },
        overwrite: true,
        maxFileSize: 1000000 //1mb
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
    removeQuestionDirectory: function (questionId) {
        exec('rm -rf ' + uploadDir + '/questions/' + questionId);
    }
});
