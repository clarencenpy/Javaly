Template.submitQuestion.events({
    'click #addTest': function (event, instance) {
        instance.$('#test-container').append('\
            <tr>\
                <td>\
                    <input name="input" type="text" class="form-control">\
                </td>\
                <td>\
                    <input name="output" type="text" class="form-control">\
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

            question.test = {};
            question.test.testcases = [];
            instance.$('#test-container>tr').each(function (index, elem) {
                var $elem = $(elem);
                question.test.testcases.push({
                    input: $elem.find('input[name="input"]').val(),
                    output: $elem.find('input[name="output"]').val(),
                    type: $elem.find('input[name="type"]').val()
                })
            });

            question.test.questionType = instance.$('select[name="questionType"]').val();
            question.test.methodName = instance.$('input[name="methodName"]').val();
            question.test.static = instance.$('select[name="static"]').val() === 'true';

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
            swal('Not so fast','Please ensure that you have filled all fields correctly', 'warning');
        }

    }
});


