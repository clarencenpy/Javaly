Template.submitQuestion.onRendered(function () {
    var template = this;
    template.release = new ReactiveVar(false);
    this.$('[data-toggle=tooltip]').tooltip({
        container: 'body'
    });

    // Initialize i-check plugin
    this.$('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    this.$('.i-checks input')
        .on('ifChecked', function(){
            template.release.set(true);
        })
        .on('ifUnchecked', function () {
            template.release.set(false);
        });

    //subscribe to tags
    template.subscribe('allTags');
});

Template.submitQuestion.helpers({
    config: function () {
        return function(editor) {
            editor.setTheme('ace/theme/crimson_editor');
            editor.getSession().setMode('ace/mode/java');
            editor.setHighlightActiveLine(false);
            editor.setShowPrintMargin(false);
        }
    }
});

Template.submitQuestion.events({
    'click #addTest': function (event, instance) {
        instance.$('#test-container').append('\
            <tr>\
                <td>\
                    <textarea name="description" type="text" class="form-control"></textarea>\
                </td>\
                <td>\
                    <textarea name="prepCode" class="form-control" style="font-family: monospace"></textarea>\
                </td>\
                <td>\
                    <input name="input" type="text" class="form-control" style="font-family: monospace">\
                </td>\
                <td>\
                    <textarea name="output" type="text" class="form-control" style="font-family: monospace"></textarea>\
                </td>\
                <td>\
                    <select name="visibility" class="form-control" >\
                        <option value="SHOW" selected>Show</option>\
                        <option value="HIDDEN">Hidden</option>\
                    </select>\
                </td>\
                <td>\
                    <button class="remove-btn btn btn-white"><i class="fa fa-trash"></i> </button>\
                </td>\
            </tr>'
        );
    },

    'click .remove-btn': function (event, instance) {
        $(event.target).closest('tr').remove();
    },


    'click #submit-btn': function (event, instance) {
        if (AutoForm.validateForm('insertQuestionForm')) {
            var question = {};

            question.title = AutoForm.getFieldValue('title', 'insertQuestionForm');
            question.tags = AutoForm.getFieldValue('tags', 'insertQuestionForm');
            question.content = AutoForm.getFieldValue('content', 'insertQuestionForm');
            question.classname = AutoForm.getFieldValue('classname', 'insertQuestionForm');
            question.methodName = AutoForm.getFieldValue('methodName', 'insertQuestionForm');
            question.questionType = AutoForm.getFieldValue('questionType', 'insertQuestionForm');
            question.methodType = AutoForm.getFieldValue('methodType', 'insertQuestionForm');

            question.testCases = [];
            instance.$('#test-container>tr').each(function (index, elem) {
                var $elem = $(elem);
                question.testCases.push({
                    description: $elem.find('textarea[name="description"]').val(),
                    prepCode: $elem.find('textarea[name="prepCode"]').val(),
                    input: $elem.find('input[name="input"]').val(),
                    output: $elem.find('textarea[name="output"]').val(),
                    visibility: $elem.find('select[name="visibility"]').val()
                });
            });

            var editor = ace.edit('editor');
            var code = editor.getSession().getValue();
            question.solution = {
                code: code,
                release: instance.release.get()
            };

            console.log(question);

            var questionId = Questions.insert(question);

            swal({
                title: "Question Submitted!",
                text: "The question will only be successfully published when it has at least one successful attempt (from you of course!)",
                type: "success",
                showCancelButton: true,
                allowEscapeKey: false,
                confirmButtonText: 'Try it now!'

            }, function (isConfirm) {
                if (isConfirm) {
                    var attemptId = Attempts.insert({
                        userId: Meteor.userId(),
                        questionId: questionId
                    });
                    Router.go('codepad', {id: attemptId})
                } else {
                    Router.go('questionManager');
                }
            });

            console.log(questionId + ' inserted');

        } else {
            swal('Not so fast','Please ensure that you have filled up the required fields from all tabs!', 'warning');
        }

    }
});


