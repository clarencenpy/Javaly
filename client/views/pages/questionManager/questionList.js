Template.questionList.onRendered(function () {
    this.$('#datatable').DataTable({
        paging: false,
        info: false,
        searching: false,
        aoColumns: [null, null, null, null, {bSortable: false}]
    });
});

Template.questionList.events({
    'click .goto-question-btn': function (event, instance) {
        var questionId = this._id;
        //check if previous attempt exists
        var attempt =  Attempts.findOne({questionId: questionId, userId: Meteor.userId()});
        if (attempt === undefined) {
            var attemptId = Attempts.insert({
                userId: Meteor.userId(),
                questionId: questionId
            });
            Router.go('codepad', {id: attemptId});
        } else {
            Router.go('codepad', {id: attempt._id});
        }
    }
})