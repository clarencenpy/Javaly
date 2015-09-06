Template.questionStats.onCreated(function () {
    this.completedPercentage = new ReactiveVar();
    this.attemptedButNotCompletedPercentage = new ReactiveVar();
    this.sortByField = new ReactiveVar();
    this.ascending = new ReactiveVar();
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

        //sort
        var sortByField = Template.instance().sortByField.get() || 'timeTaken';
        var ascending = Template.instance().ascending.get() || false;
        result = _.sortBy(result, sortByField);
        if (!ascending) {
            result = result.reverse();
        }
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
    'click .toggle-sort': function (event, instance) {
        var field = $(event.target).data('field');
        if (instance.sortByField.get() === field) {
            instance.ascending.set(!instance.ascending.get()); //toggle asc/desc
        } else {
            instance.sortByField.set(field);
        }
    },
    'click .view-code-btn': function () {
        Session.set('selectedAttempt', this.attemptId);
    }
});
