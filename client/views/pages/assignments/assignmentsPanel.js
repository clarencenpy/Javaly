Template.assignmentsPanel.onCreated(function () {
    var template = this;
    template.showCompletedQuestions = ReactiveVar(true);
    template.showCompletedExercises = ReactiveVar(true);
    template.showCompletedGroups = ReactiveVar(false);
});

Template.assignmentsPanel.helpers({
    currentActiveAttempt: function () {
        return Router.current().params._id;
    },

    groups: function (activeAttemptId) {

        //add a completed flag to each group > exercise > question
        //add a active flag for the current question > exercise > group
        var groups = Groups.find({participants: Meteor.userId()}).fetch();
        groups = _.map(groups, function (group) {
            group.completed = true;
            group.exercises = _.map(group.exercises, function (exercise) {
                exercise.completed = true;
                exercise.questions = _.map(exercise.questions, function (questionId) {
                    var question = Questions.findOne(questionId);
                    var attempt = Attempts.findOne({questionId: questionId, userId: Meteor.userId()});
                    if (!attempt || !attempt.completed) exercise.completed = false;

                    var currentAttempt = Attempts.findOne(activeAttemptId);
                    var active = currentAttempt && currentAttempt.questionId === questionId;
                    if (active) exercise.active = true;
                        return {
                        _id: questionId,
                        title: question.title,
                        completed: attempt ? attempt.completed : false,
                        active: active
                    }
                });
                if (!exercise.completed) group.completed = false;
                if (exercise.active) group.active = true;
                return exercise;
            });
            return group;
        });
        return groups;
    },

    toShowQuestion: function (complete) {
        var showCompleted = Template.instance().showCompletedQuestions.get();
        if (showCompleted) {
            return true;
        } else {
            return !complete;
        }
    },
    toShowExercise: function (complete) {
        var showCompleted = Template.instance().showCompletedExercises.get();
        if (showCompleted) {
            return true;
        } else {
            return !complete;
        }
    },
    toShowGroup: function (complete) {
        var showCompleted = Template.instance().showCompletedGroups.get();
        if (showCompleted) {
            return true;
        } else {
            return !complete;
        }
    }
});

Template.assignmentsPanel.events({
    'click .goto-question-btn': function (event, instance) {
        var questionId = this._id;
        //check if previous attempt exists
        Meteor.call('getAttemptId', questionId, Meteor.userId(), function (err, res) {
            if (res) {  //id
                Router.go('codepad', {_id: res});
            } else {
                var attemptId = Attempts.insert({
                    userId: Meteor.userId(),
                    questionId: questionId
                });
                Router.go('codepad', {_id: attemptId});
            }
        });
    }
});