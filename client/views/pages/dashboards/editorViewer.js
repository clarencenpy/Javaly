Template.editorViewer.onCreated(function () {
    var template = this;
    template.showHistory = new ReactiveVar(false);
    template.historyLoaded = new ReactiveVar(true);
    template.history = new ReactiveVar([]);
    template.currentAttemptIndex = new ReactiveVar(0);
});

Template.editorViewer.onRendered(function () {
    var template = this;

    $('#codepad-modal').on('hide.bs.modal', function () {
        template.showHistory.set(false);
        template.historyLoaded.set(false);
        template.history.set([]);
        template.currentAttemptIndex = new ReactiveVar(0);
    });

});

Template.editorViewer.helpers({
    config: function () {
        return function(editor) {
            editor.setTheme('ace/theme/crimson_editor');
            editor.getSession().setMode('ace/mode/java');
            editor.setHighlightActiveLine(false);
            editor.setShowPrintMargin(false);
        }
    },
    historyConfig: function () {
        return function(editor) {
            editor.setReadOnly(true);
            editor.setTheme('ace/theme/solarized_light');
            editor.getSession().setMode('ace/mode/java');
            editor.setHighlightActiveLine(false);
            editor.setShowPrintMargin(false);
        }
    },
    historyLoaded: function () {
        return Template.instance().historyLoaded.get();
    },
    //for conditional display of the arrows
    isFirst: function () {
        return Template.instance().currentAttemptIndex.get() === 0;
    },
    isLast: function () {
        var history = Template.instance().history.get();
        if (history.length === 0) return true;
        return Template.instance().currentAttemptIndex.get() === history.length - 1;
    },
    attemptDisplay: function () {
        var history = Template.instance().history.get();
        if (history === undefined) return '';
        if (history.length === 0) {
            return 'No attempts yet';
        }
        return 'Attempt ' + (Template.instance().currentAttemptIndex.get() + 1) + '/' + history.length;
    },
    currentAttempt: function () {
        var history = Template.instance().history.get();
        if (history.length === 0) return;
        return history[Template.instance().currentAttemptIndex.get()];
    },
    renderStatus: function (status) {
        switch (status) {
            case 'COMPILE_ERROR':
                return '<span class="pull-right" style="color: red">Compile Error</span>';
            case 'PASS':
                return '<span class="pull-right" style="color: green">Pass</span>';
            case 'FAIL':
                return '<span class="pull-right" style="color: red">Fail</span>';
        }
    }
});

Template.editorViewer.helpers({
    showHistory: function () {
        return Template.instance().showHistory.get();
    },
    label: function () {
        return Template.instance().showHistory.get() ? 'History' : 'Editor';
    }
});

Template.editorViewer.events({
    'click #history-btn': function(event, instance) {
        instance.showHistory.set(!instance.showHistory.get());
        instance.historyLoaded.set(false);
        Meteor.call('history', instance.data, function (err, res) {
            instance.history.set(res.history || []);
            instance.historyLoaded.set(true);

            //preload the first attempt, if any
            Tracker.afterFlush(function () {
                if (instance.showHistory.get()) {
                    var history = instance.history.get();
                    if (history.length > 0) {
                        var editor = ace.edit('history');
                        editor.getSession().setValue(history[0].code);
                    }
                }
            })
        })
    },
    'click #back-btn': function (event, instance) {
        var i = instance.currentAttemptIndex.get()-1;
        instance.currentAttemptIndex.set(i);

        var editor = ace.edit('history');
        var history = instance.history.get();
        if (history.length > 0) {
            editor.getSession().setValue(history[i].code);
        }
    },
    'click #fwd-btn': function (event, instance) {
        var i = instance.currentAttemptIndex.get()+1;
        instance.currentAttemptIndex.set(i);

        var editor = ace.edit('history');
        var history = instance.history.get();
        if (history.length > 0) {
            editor.getSession().setValue(history[i].code);
        }
    }
});