Template.updateQuestion.onRendered(function () {
    this.$('[data-toggle=tooltip]').tooltip({
        container: 'body'
    });
});

Template.updateQuestion.helpers({
    isVisible: function (string) {
        return string === 'SHOW';
    },
    isNotVisible: function (string) {
        return string === 'HIDDEN';
    }
});

Template.updateQuestion.events({
    'click #addTest': function (event, instance) {
        instance.$('#test-container').append('\
            <tr>\
                <td>\
                    <textarea name="prepCode" rows="4" class="form-control" style="font-family: monospace"></textarea>\
                </td>\
                <td>\
                    <input name="input" type="text" class="form-control" style="font-family: monospace">\
                </td>\
                <td>\
                    <input name="output" type="text" class="form-control" style="font-family: monospace">\
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
        if (
            AutoForm.validateField('title','updateQuestionForm') &&
            AutoForm.validateField('tags','updateQuestionForm') &&
            AutoForm.validateField('content','updateQuestionForm') &&
            AutoForm.validateField('classname','updateQuestionForm') &&
            AutoForm.validateField('methodName','updateQuestionForm') &&
            AutoForm.validateField('questionType','updateQuestionForm') &&
            AutoForm.validateField('static','updateQuestionForm')
        ) {


            var testCases = [];
            instance.$('#test-container>tr').each(function (index, elem) {
                var $elem = $(elem);
                testCases.push({
                    prepCode: $elem.find('textarea[name="prepCode"]').val(),
                    input: $elem.find('input[name="input"]').val(),
                    output: $elem.find('input[name="output"]').val(),
                    visibility: $elem.find('select[name="visibility"]').val()
                })
            });


            Questions.update(Template.currentData()._id, {$set: {
                title: AutoForm.getFieldValue('title', 'updateQuestionForm'),
                tags: AutoForm.getFieldValue('tags', 'updateQuestionForm'),
                content: AutoForm.getFieldValue('content', 'updateQuestionForm'),
                classname: AutoForm.getFieldValue('classname', 'updateQuestionForm'),
                methodName: AutoForm.getFieldValue('methodName', 'updateQuestionForm'),
                questionType: AutoForm.getFieldValue('questionType', 'updateQuestionForm'),
                methodType: AutoForm.getFieldValue('methodType', 'updateQuestionForm'),
                testCases: testCases
            }});

            swal({
                title: "Question Updated!",
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


        } else {
            swal('Not so fast','Please ensure that you have filled up the required fields from all tabs!', 'warning');
        }

    }
});


