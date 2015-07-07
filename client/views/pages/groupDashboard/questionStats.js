Template.questionStats.onRendered(function () {
    //init datatables for every table
    this.$('.datatable').each(function () {
        $(this).DataTable({
            paging: false,
            info: false,
            searching: false,
            aoColumns: [null, null, null, null, {bSortable: false}]
        });
    })
});

Template.questionStats.helpers({
    question: function () {
        return Questions.findOne(this.toString());
    },

    students: function () {
        var questionId = this.toString();
        var group = Template.parentData(2);

        //collate stats for every student
        var result = [];
        _.each(group.participants, function (userId) {
            var attempt = Attempts.findOne({userId: userId, questionId: questionId});
            result.push({
                name: Meteor.users.findOne(userId).profile.name,
                attempts: attempt ? attempt.history ? attempt.history.length : 0 : 0,
                timeTaken: attempt ? attempt.totalActiveTime ? attempt.totalActiveTime : 0 : 0,
                completed: attempt ? attempt.result ? attempt.result.success : false : false,
                attemptId: attempt ? attempt._id : false
            });
        });
        return result;
    }
});
