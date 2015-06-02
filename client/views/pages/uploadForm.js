Template.uploadForm.events({
    'click #compile-btn': function () {
        Meteor.call('compile', {
            classpath: '/Users/clarencenpy/Desktop/cfs/attempts/aid0001',
            filepath: '/Users/clarencenpy/Desktop/cfs/questions/id0001/Test.java'
        }, function (err, result) {
            if (err) {
                console.log(err.error);
                return;
            }
            console.log(result);
        });

        Meteor.call('run', {
            classpath: '/Users/clarencenpy/Desktop/cfs/questions/id0001' + ':' + '/Users/clarencenpy/Desktop/cfs/attempts/aid0001',
            filepath: 'Test'
        }, function (err, result) {
            if (err) {
                console.log(err.error);
                return;
            }
            console.log(result);
        });
    }
});