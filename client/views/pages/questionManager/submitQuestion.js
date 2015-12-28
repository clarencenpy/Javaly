Template.submitQuestion.onCreated(function () {
    var template = this;

    //prepare a id for the to be submitted question, so that we know where to dump the file uploads
    template.questionId = Random.id();

});

Template.submitQuestion.onRendered(function () {
    var template = this;

    //subscribe to tags
    template.subscribe('allTags', function () {
        Tracker.afterFlush(function () {
            //init tooltips
            template.$('[data-toggle=tooltip]').tooltip({
                container: 'body'
            });
        })
    })


});

Template.submitQuestion.helpers({
    config: function () {
        return function(editor) {
            editor.setTheme('ace/theme/crimson_editor');
            editor.getSession().setMode('ace/mode/java');
            editor.setHighlightActiveLine(false);
            editor.setShowPrintMargin(false);
        }
    },
    uploadJarFormData: function () {
        return {
            _id: Template.instance().questionId,
            purpose: 'JAR'
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

            question._id = Template.instance().questionId;
            question.title = AutoForm.getFieldValue('title', 'insertQuestionForm');
            question.tags = AutoForm.getFieldValue('tags', 'insertQuestionForm');
            question.content = AutoForm.getFieldValue('content', 'insertQuestionForm');

            //retrieve editor contents for test code
            var editor = ace.edit('editor');
            var code = editor.getSession().getValue();
            console.log(code);
            question.testCode = code.length > 0 ? code : undefined;

            if (!question.testCode) {
                question.classname = AutoForm.getFieldValue('classname', 'insertQuestionForm');
                question.methodName = AutoForm.getFieldValue('methodName', 'insertQuestionForm');
                question.questionType = AutoForm.getFieldValue('questionType', 'insertQuestionForm');
                question.methodType = AutoForm.getFieldValue('methodType', 'insertQuestionForm');
                question.testCases = [];
                instance.$('#test-container>tr').each(function (index, elem) {
                    var $elem = $(elem);
                    var testCase = {
                        description: $elem.find('textarea[name="description"]').val(),
                        prepCode: $elem.find('textarea[name="prepCode"]').val(),
                        input: $elem.find('input[name="input"]').val(),
                        output: $elem.find('textarea[name="output"]').val(),
                        visibility: $elem.find('select[name="visibility"]').val()
                    };
                    if (testCase.description.length === 0
                        && testCase.prepCode.length === 0
                        && testCase.input.length === 0
                        && testCase.output.length === 0
                    ) {
                        // the whole row is empty, ignore
                    } else {
                        question.testCases.push(testCase);
                    }
                });

                if (!question.methodName || !question.methodType || !question.questionType || question.testCases.length === 0) {
                    swal({
                        title: 'Not so fast',
                        text: '<strong>Please ensure that you:<strong>' +
                                '<br>A) Write a test class OR' +
                                '<br>B) Define your test with the GUI properly' +
                                '<br>&#8226 Method Name is provided' +
                                '<br>&#8226 Output Type is provided' +
                                '<br>&#8226 Method Type is provided' +
                                '<br>&#8226 At least one test case is defined',
                        type: 'warning',
                        html: true
                    });
                    return;
                }
            }

            Questions.insert(question);

            swal({
                title: "Question Submitted!",
                text: "The question will only be successfully published when it has at least one successful attempt (from you of course!)",
                type: "success",
                showCancelButton: true,
                allowEscapeKey: false,
                confirmButtonText: 'Try it now!',
                cancelButtonText: 'Back'

            }, function (isConfirm) {
                if (isConfirm) {
                    var attemptId = Attempts.insert({
                        userId: Meteor.userId(),
                        questionId: question._id
                    });
                    Router.go('codepad', {id: attemptId})
                } else {
                    Router.go('questionManager');
                }
            });

            console.log(question._id + ' inserted');

        } else {
            swal('Not so fast','Please ensure that you have filled up the required fields from all tabs!', 'warning');
        }

    }
});


