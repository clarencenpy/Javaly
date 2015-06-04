Meteor.startup(function () {

    //init code for upload-server package
    UploadServer.init({
        tmpDir: process.env.PWD + '/uploads/tmp',
        uploadDir: process.env.PWD + '/uploads/',
        checkCreateDirectories: true, //create the directories for you
        getDirectory: function (fileInfo, formData) {
            return 'questions/' + formData.questionId;
        },
        finished: function (fileInfo, formData) {
            Questions.update(formData.questionId, {$set: {uploaded: true}});
        }
    })
});