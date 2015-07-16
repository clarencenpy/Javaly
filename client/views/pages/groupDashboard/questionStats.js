Template.questionStats.onCreated(function () {
    this.completedPercentage = new ReactiveVar();
    this.attemptedButNotCompletedPercentage = new ReactiveVar();
});

Template.questionStats.onRendered(function () {
    //init datatables for every table
    this.$('.datatable').each(function () {
        $(this).DataTable({
            paging: false,
            info: false,
            searching: false,
            aoColumns: [null, null, {iDataSort: 3}, {visible: false}, null, {bSortable: false}]
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

        //collate stats for every student, at the same time calculate complete percentage
        var attempted = 0;
        var completed = 0;
        var result = [];
        _.each(group.participants, function (userId) {
            var attempt = Attempts.findOne({userId: userId, questionId: questionId});
            var userInfo = {
                name: Meteor.users.findOne(userId).profile.name,
                attempts: attempt ? attempt.history ? attempt.history.length : 0 : 0,
                timeTaken: attempt ? attempt.totalActiveTime ? attempt.totalActiveTime : 0 : 0,
                completed: attempt ? attempt.completed : false,
                attemptId: attempt ? attempt._id : false
            };
            result.push(userInfo);

            if (userInfo.attempts > 0) {
                attempted++;
                if (userInfo.completed) {
                    completed++;
                }
            }
        });

        //calculate percentages
        var total = group.participants.length;
        Template.instance().completedPercentage.set(Math.round(completed/total*100));
        Template.instance().attemptedButNotCompletedPercentage.set(Math.round((attempted - completed)/total*100));

        return result;
    },

    completedPercentage: function () {
        return Template.instance().completedPercentage.get();
    },

    attemptedButNotCompletedPercentage: function () {
        return Template.instance().attemptedButNotCompletedPercentage.get();
    }
});

Template.questionStats.events({
   'click .goto-question-btn': function () {
       Router.go('codepad', {id: this.attemptId});
   }
});

