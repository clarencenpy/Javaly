Template.studentDashboard.onCreated(function () {
    var template = this;
    //setting up filters
    template.groupFilter = new ReactiveVar('');
    template.showOptions = new ReactiveVar('INCOMPLETE');
});

Template.studentDashboard.onRendered(function () {

    var template = this;

    // Add slimScroll to element
    template.$('.full-height-scroll').slimscroll({
        height: '100%'
    });

    // Add slimScroll to left navigation
    template.$('.sidebar-collapse').slimScroll({
        height: '100%',
        railOpacity: 0.9
    });


    //init filters
    template.$('#groupFilter').select2({
        placeholder: 'Filter groups',
        allowClear: true
    }).on('change', function () {
        template.groupFilter.set($(this).val());
    });

    template.$('#showOptions').select2({
        minimumResultsForSearch: Infinity   //hide search box
    }).on("change", function (e) {
        template.showOptions.set($(this).val());
    });
});

Template.studentDashboard.helpers({
    //join groups
    availableGroups: function () {
        return Groups.find({
            participants: {$not: Meteor.userId()},
            pendingParticipants: {$not: Meteor.userId()},
            groupType: {$not: 'PRIVATE'}
        });
    },
    getName: function (id) {
        return Meteor.users.findOne(id).profile.name;
    },
    enrolledGroups: function () {
        return Groups.find({participants: Meteor.userId()});
    },
    pendingGroups: function () {
        return Groups.find({pendingParticipants: Meteor.userId()});
    },
    pendingAndEnrolledGroups: function () {
        return Groups.find({$or: [
            {participants: Meteor.userId()},
            {pendingParticipants: Meteor.userId()}
        ]});
    },
    canRequest: function (groupType) {
        return groupType === 'ACCEPT_REQUEST';
    },
    isPrivate: function (groupType) {
        return groupType === 'PRIVATE';
    },


    //inbox
    groupsFilter: function () {
        return Groups.find({participants: Meteor.userId()});
    },
    showExercise: function (completed) {
        var filter = Template.instance().showOptions.get();
        if (filter === 'ALL') {
            return true;
        }
        if (filter === 'INCOMPLETE') {
            return !completed;
        }
        if (filter === 'COMPLETE') {
            return completed;
        }

    },
    exercises: function () {
        var exercises = [];
        var groupFilter = Template.instance().groupFilter.get();

        var groups;
        if (groupFilter.length === 0) {
            //show all groups
            groups = Groups.find({participants: Meteor.userId()}).fetch();
        } else {
            //show matched group
            groups = [Groups.findOne(groupFilter)];
        }

        _.each(groups, function (group) {
            _.each(group.exercises, function (exercise) {
                if (exercise.show) {
                    exercise.groupName = group.name;

                    var completed = 0;
                    var attempted = 0;
                    exercise.questions = _.map(exercise.questions, function (questionId) {
                        var q = Questions.findOne(questionId);
                        if (q === undefined) return;
                        var attempts = Attempts.find({questionId: questionId, userId: Meteor.userId()}, {sort: {createdAt: -1}}).fetch();
                        q.numAttempts = attempts.length;
                        if (attempts.length > 0) {
                            var curAttempt = attempts[0];
                            q.attemptId = curAttempt._id;
                            q.completed = curAttempt.completed;
                            q.lastAttempted = curAttempt.history ? curAttempt.history[0].date: undefined;
                            if (curAttempt.completed) {
                                completed++;
                            } else {
                                if (curAttempt.history && curAttempt.history.length > 0) attempted++;
                            }
                        }
                        return q;
                    });
                    exercise.numCompleted = completed;
                    exercise.completedPercentage = completed / exercise.questions.length * 100;
                    exercise.attemptedPercentage = attempted / exercise.questions.length * 100;
                    if (completed === exercise.questions.length) exercise.completed = true;
                    exercises.push(exercise);
                }
            })
        });

        return exercises;
    }
});

Template.studentDashboard.events({
    'click .goto-question-btn': function () {
        var questionId = this._id;
        if (this.attemptId) {  //id
            Router.go('codepad', {_id: this.attemptId});
        } else {
            var attemptId = Attempts.insert({
                userId: Meteor.userId(),
                questionId: questionId
            });
            Router.go('codepad', {_id: attemptId});
        }
    },
    'click #join-btn': function () {
        Meteor.call('requestJoinGroup', this._id, function (err, res) {
            if (err) console.log(err);
        })
    },
    'click #leave-btn': function () {
        Meteor.call('leaveGroup', this._id, function (err, res) {
            if (err) console.log(err);
        })
    }
});

Template.studentDashboard.onDestroyed(function () {

    var template = this;

    // Remove special class for full height
    $('body').removeClass('full-height-layout');

    template.$('.full-height-scroll').slimscroll({
        destroy:true
    });

    // Destroy slimScroll for left navigation
    template.$('.sidebar-collapse').slimScroll({
        destroy:true
    });

    // Remove inline style form slimScroll
    template.$('.sidebar-collapse').removeAttr("style");
});

