Template.editor.events({
    'click #compile-btn': function () {
        //display load spinner
        Session.set('executing', true);

        //retrieve editor contents
        var editor = ace.edit('editor');
        var code = editor.getSession().getValue();

        Meteor.call('compileAndRun', {
            attemptId: Router.current().params.id,
            code: code
        }, function (err, result) {
            if (err) {
                Session.set('compileError', err.error);
                Session.set('compileResult', null);
                Session.set('executing', false);
                console.log(err.error);
                return
            }
            Session.set('compileResult', JSON.parse(result));
            Session.set('compileError', null);
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

    docid: function () {
        return Router.current().params.id;
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
