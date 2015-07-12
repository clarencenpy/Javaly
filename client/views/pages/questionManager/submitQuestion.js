Template.submitQuestion.onRendered(function () {
    this.$('[data-toggle=tooltip]').tooltip({
        container: 'body'
    });
});

Template.submitQuestion.events({
    'click #addTest': function (event, instance) {
        instance.$('#test-container').append('\
            <tr>\
                <td>\
                    <textarea name="input" rows="4" class="form-control" style="font-family: monospace"></textarea>\
                </td>\
                <td>\
                    <input name="input" type="text" class="form-control" style="font-family: monospace">\
                </td>\
                <td>\
                    <input name="output" type="text" class="form-control" style="font-family: monospace">\
                </td>\
                <td>\
                    <select name="type" class="form-control" >\
                        <option selected>Show</option>\
                        <option>Hidden</option>\
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
            question.static = AutoForm.getFieldValue('static', 'insertQuestionForm');

            question.testcases = [];
            instance.$('#test-container>tr').each(function (index, elem) {
                var $elem = $(elem);
                question.testcases.push({
                    prepCode: $elem.find('textarea[name="prepCode"]').val(),
                    input: $elem.find('input[name="input"]').val(),
                    output: $elem.find('input[name="output"]').val(),
                    type: $elem.find('input[name="type"]').val()
                })
            });


            console.log(question);

            var questionId = Questions.insert(question);

            //TODO: remove this after beta
            Groups.update(Groups.findOne({name: 'Beta Testers'})._id, {$push: {
                'exercises.0.questions': questionId
            }});

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


