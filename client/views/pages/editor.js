Template.editor.onRendered (function () {
    var questionId = '001';
    var attempt = Attempts.findOne({userId: Meteor.userId(), questionId: questionId});

    if (!attempt) { //no such record yet
        var attemptId = Attempts.insert({
            userId: Meteor.userId(),
            questionId: questionId
        });
        Session.set('curAttempt', attemptId);
    } else {
        Session.set('curAttempt', attempt._id);
    }

});

Template.editor.events({
    'click #compile-btn': function () {
        //retrieve editor contents
        var editor = ace.edit('editor');
        var code = editor.getSession().getValue();

        Meteor.call('compileAndRun', {
            attemptId: Session.get('curAttempt'),
            classname: 'Adder',
            code: code
        }, function (err, result) {
            if (err) {
                console.log(err.error);
                return;
            }
            console.log(result);
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

    docid: function () {
        return '0001';
    }
});
