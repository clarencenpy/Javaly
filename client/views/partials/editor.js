Template.editor.onRendered(function () {
    //Init timeMe.js
    TimeMe.setIdleDurationInSeconds(15);
    TimeMe.setCurrentPageName('editor');
    TimeMe.initialize();
});


Template.editor.events({
    'click #compile-btn': function () {
        //display load spinner
        Session.set('executing', true);

        //retrieve active time
        var activeTime = TimeMe.getTimeOnCurrentPageInSeconds();
        TimeMe.resetRecordedPageTime('editor');
        TimeMe.startTimer();
        console.log('Active time: ' + activeTime);


        //retrieve editor contents
        var editor = ace.edit('editor');
        var code = editor.getSession().getValue();

        Meteor.call('compileAndRun', {
            attemptId: Router.current().params.id,
            code: code,
            activeTime: activeTime
        }, function (err, result) {
            if (err) {
                console.log(err);
                Session.set('executing', false);
                return
            }
            console.log(result);
            if (result.status.indexOf('error') === 0) {
                Session.set('compileError', result.message);
                Session.set('compileResult', null);
            } else if (result.status === 'completed') {
                Session.set('compileResult', result);
                Session.set('compileError', null);
            } else if (result.status === 'unchanged') {
                //do nothing if user has not modified the code
            }
            Session.set('executing', false);
        });
    }
});

Template.editor.helpers({
    config: function () {
        return function(editor) {
            editor.setTheme('ace/theme/crimson_editor');
            editor.getSession().setMode('ace/mode/java');
            editor.setHighlightActiveLine(false);
            editor.setShowPrintMargin(false);
            editor.getSession().setUseWrapMode(true);
        }
    },

    executing: function () {
        return Session.get('executing');
    }
});

Template.editor.destroyed = function () {
    Session.set('executing', null);
    Session.set('compileResult', null);
    Session.set('compileError', null);
}
