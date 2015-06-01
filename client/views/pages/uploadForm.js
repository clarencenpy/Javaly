Template.uploadForm.events({
    'change #fileInput': function (event, template) {
        FS.Utility.eachFile(event, function(file) {
            JavaFiles.insert(file, function (err, fileObj) {
                // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                if (err) {
                    console.log(err.message);
                    return;
                }
                console.log('Success: ' + fileObj._id);
            });
        });
    }
})