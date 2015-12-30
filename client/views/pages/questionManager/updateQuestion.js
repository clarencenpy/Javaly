Template.updateQuestion.onCreated(function () {
    var template = this;

    //this is for getting the uploaded files
    template.uploadedFiles = new ReactiveVar(false);
    //fetch the data async
    Meteor.call('getFileNames', template.data._id, function (err, res) {
        if (err) {
            console.log(err);
            return;
        }
        if (res.length > 0) {
            template.uploadedFiles.set(res);
        }
    });
    template.javadocPath = new ReactiveVar(false);
    template.uploadedJavadocs = new ReactiveVar(false);
    Meteor.call('getJavadocs', template.data._id, function (err, res) {
        if (err) {
            console.log(err);
            return;
        }
        if (res.length > 0) {
            template.uploadedJavadocs.set(true);
        }
    })
});

Template.updateQuestion.onRendered(function () {
    var template = this;

    //subscribe to tags
    template.subscribe('allTags', function () {
        Tracker.afterFlush(function () {
            template.$('[data-toggle=tooltip]').tooltip({
                container: 'body'
            });

            //Populate with previous solution object
            var editor = ace.edit('editor');
            editor.getSession().setValue(template.data.testCode ? template.data.testCode : '');
        })
    });

});

Template.updateQuestion.helpers({
    config: function () {
        return function (editor) {
            editor.setTheme('ace/theme/crimson_editor');
            editor.getSession().setMode('ace/mode/java');
            editor.setHighlightActiveLine(false);
            editor.setShowPrintMargin(false);
        }
    },
    isVisible: function (string) {
        return string === 'SHOW';
    },
    isNotVisible: function (string) {
        return string === 'HIDDEN';
    },
    uploadJarFormData: function () {
        return {
            _id: Template.instance().data._id,
            purpose: 'JAR'
        }
    },
    uploadJavadocsFormData: function () {
        return {
            _id: Template.instance().data._id,
            purpose: 'JAVADOCS'
        }
    },
    uploadJavadocsCallback: function() {
        var template = Template.instance();
        return {
            finished: function(index, fileInfo, context) {
                template.uploadedJavadocs.set(true);
            }
        }
    },
    uploadedJavadocs: function () {
        return Template.instance().uploadedJavadocs.get();
    },
    javadocPath: function () {
        return 'kuala.smu.edu.sg/javadocs/' + Template.instance().data._id + '/index.html';
    },
    uploadedFiles: function () {
        return Template.instance().uploadedFiles.get();
    },
    testCodePresent: function () {
        return !!Template.instance().data.testCode;
    },
    classname: function () {
        return Template.instance().data.classname;
    }
});

Template.updateQuestion.events({
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

    'click #returnValueTemplate-btn': function () {
        var editor = ace.edit('editor');
        editor.getSession().setValue('import static javaly.core.Test.*;\n' +
            'import javaly.core.*;\n' +
            'public class StagingMethodTest {\n' +
            '\t@TestCase(expectedOutput="<expectedOutput>")\n' +
            '\tpublic void test0() throws Exception {\n' +
            '\t\tassertEquals("<description>", <expectedOutput>, <Method Call>);\n' +
            '\t}\n' +
            '}');
    },


    'click #systemOutputTemplate-btn': function () {
        var editor = ace.edit('editor');
        editor.getSession().setValue('import static javaly.core.Test.*;\n' +
            'import javaly.core.*;\n' +
            'public class StagingMethodTest {\n' +
            '\t@TestCase(expectedOutput="<expectedOutput>")\n' +
            '\tpublic void test0() throws Exception {\n' +
            '\t\tassertEquals("<description>", <expectedOutput>, retrieveSystemOutput());\n' +
            '\t}\n' +
            '}');
    },

    'click #catchExceptionTemplate-btn': function () {
        var editor = ace.edit('editor');
        editor.getSession().setValue('import static javaly.core.Test.*;\n' +
            'import javaly.core.*;\n' +
            'public class StagingMethodTest {\n' +
            '\tpublic void test0() throws Exception {\n' +
            '\t\t//expectThrowable MUST come before all other code within the method\n' +
            '\t\texpectThrowable("<description>", new Throwable("<message>"));\n' +
            '\t\t//run code that is expected to throw the exception here\n\n\n' +
            '\t}\n' +
            '}');
    },

    'click #hiddenTestTemplate-btn': function () {
        var editor = ace.edit('editor');
        editor.getSession().setValue('import static javaly.core.Test.*;\n' +
            'import javaly.core.*;\n' +
            'public class StagingMethodTest {\n' +
            '\t@TestCase(expectedOutput="<expectedOutput>", hidden=true)\n' +
            '\tpublic void test0() throws Exception {\n' +
            '\t\tassertEquals("<description>", <expectedOutput>, <Method Call>);\n' +
            '\t}\n' +
            '}');
    },

    'click #clear-btn': function () {
        var editor = ace.edit('editor');
        editor.getSession().setValue('');
    },


    'click .remove-btn': function (event, instance) {
        $(event.target).closest('tr').remove();
    },

    'click #submit-btn': function (event, instance) {
        if (
            AutoForm.validateField('title', 'updateQuestionForm') &&
            AutoForm.validateField('tags', 'updateQuestionForm') &&
            AutoForm.validateField('content', 'updateQuestionForm') &&
            AutoForm.validateField('classname', 'updateQuestionForm') &&
            AutoForm.validateField('methodName', 'updateQuestionForm') &&
            AutoForm.validateField('questionType', 'updateQuestionForm') &&
            AutoForm.validateField('static', 'updateQuestionForm')
        ) {

            var update = {};
            update.title = AutoForm.getFieldValue('title', 'updateQuestionForm');
            update.tags = AutoForm.getFieldValue('tags', 'updateQuestionForm');
            update.content= AutoForm.getFieldValue('content', 'updateQuestionForm');

            //retrieve editor contents for test code
            var editor = ace.edit('editor');
            var code = editor.getSession().getValue();
            update.testCode = code.length > 0 ? code : undefined;
            update.classname = instance.$('input[name="classname-top"]').val();

            if (!update.testCode) {
                update.classname = AutoForm.getFieldValue('classname', 'updateQuestionForm');
                update.methodName = AutoForm.getFieldValue('methodName', 'updateQuestionForm');
                update.questionType = AutoForm.getFieldValue('questionType', 'updateQuestionForm');
                update.methodType = AutoForm.getFieldValue('methodType', 'updateQuestionForm');
                update.testCases = [];
                instance.$('#test-container>tr').each(function (index, elem) {
                    var $elem = $(elem);
                    var testCase = {
                        description: $elem.find('textarea[name="description"]').val(),
                        prepCode: $elem.find('textarea[name="prepCode"]').val(),
                        input: $elem.find('input[name="input"]').val(),
                        output: $elem.find('textarea[name="output"]').val(),
                        visible: $elem.find('select[name="visibility"]').val() === 'SHOW'
                    };
                    if (testCase.description.length === 0
                        && testCase.prepCode.length === 0
                        && testCase.input.length === 0
                        && testCase.output.length === 0
                    ) {
                        // the whole row is empty, ignore
                    } else {
                        update.testCases.push(testCase);
                    }
                });

                if (!update.methodName || !update.methodType || !update.questionType || update.testCases.length === 0) {
                    swal({
                        title: 'Not so fast',
                        text: '<strong>Please ensure that you:</strong>' +
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

            var toDelete = {};
            if (update.testCode) {
                //delete the testCases
                toDelete.methodName = true;
                toDelete.questionType = true;
                toDelete.methodType = true;
                toDelete.testCases = true;
            } else {
                toDelete.testCode = true
            }

            Questions.update(Template.currentData()._id, {
                $set: update,
                $unset: toDelete
            });

            swal({
                title: "Question Updated!",
                text: "The question will only be successfully published when it has at least one successful attempt (from you of course!)",
                type: "success",
                showCancelButton: true,
                allowEscapeKey: true,
                confirmButtonText: 'Try it now!',
                cancelButtonText: 'Back'

            }, function (isConfirm) {
                if (isConfirm) {
                    //check if previous attempt exists
                    var questionId = instance.data._id;
                    var attempt = Attempts.findOne({questionId: questionId, userId: Meteor.userId()});
                    if (attempt === undefined) {
                        var attemptId = Attempts.insert({
                            userId: Meteor.userId(),
                            questionId: questionId
                        });
                        Router.go('codepad', {id: attemptId});
                    } else {
                        Router.go('codepad', {id: attempt._id});
                    }
                } else {
                    Router.go('questionManager');
                }
            });


        } else {
            swal('Not so fast', 'Please ensure that you have filled up the required fields from all tabs!', 'warning');
        }

    },

    'click #delete-btn': function () {
        var id = this._id;
        swal({
            title: "Are you sure?",
            text: "Existing attempts will not be accessible by students anymore",
            type: "warning",
            showCancelButton: true,
            allowEscapeKey: true,
            confirmButtonText: 'Delete'

        }, function () {
            Questions.remove(id);
            Meteor.call('removeQuestionDirectory', id);
            Router.go('questionManager');
        });
    }
});


