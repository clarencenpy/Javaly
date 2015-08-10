Template.solution.onCreated(function () {
    var instance = this;
    instance.showButtonClicked = new ReactiveVar(false);
});

Template.solution.onRendered(function () {
    var editor = ace.edit('solution');
    var question = Questions.findOne(this.data);
    editor.getSession().setValue(question.solution.code);

});

Template.solution.helpers({
    config: function () {
        return function(editor) {
            editor.setTheme('ace/theme/crimson_editor');
            editor.getSession().setMode('ace/mode/java');
            editor.setHighlightActiveLine(false);
            editor.setShowPrintMargin(false);
            editor.setReadOnly(true);
        }
    },

    show: function () {
        return Template.instance().showButtonClicked.get();
    }
});

Template.solution.events({
    'click #show-solution-btn': function (event, instance) {
        instance.showButtonClicked.set(true);
    }
});