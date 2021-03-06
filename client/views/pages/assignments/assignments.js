Template.assignments.onCreated(function () {
    //scoping reactive variables (like session) to the template instance
    var instance = this;
    instance.questionsFromSelectedExercise = new ReactiveVar();
    instance.exerciseDescription = new ReactiveVar("Questions"); //Default value when no exercise is selected
    instance.incompleteQuestions = new ReactiveVar();
});

Template.assignments.helpers({
    exercises: function () {
        var groups =  Groups.find({participants: Meteor.userId()}).fetch();

        //collate all the exercises from various groups
        //var exercises = [];
        //_.each(groups, function (group) {
        //    exercises = exercises.concat(group.exercises);
        //});

        var exercises = [];

        _.each(groups, function (group) {
            //for each exercise, find out the progress
            _.each(group.exercises, function (exercise) {
                if (!exercise.show) return;
                var info = {
                    questions: exercise.questions,   //required by the view button to show questions
                    description: exercise.description,
                    groupName: group.name,
                    createdAt: exercise.createdAt,
                    numQuestions: exercise.questions.length,
                    attempted: 0,
                    solved: 0
                };
                _.each(exercise.questions, function (questionId) {
                    var attempt = Attempts.findOne({questionId: questionId, userId: Meteor.userId()}, {sort: {createdAt: -1}});
                    if (attempt && attempt.history) {  //have attempted before
                        info.attempted++;
                        if (attempt.completed){
                            info.solved++;
                        }
                    }
                });

                //calculate percentages for stacked progress bar
                info.completedPercentage = Math.round(info.solved/info.numQuestions*100);
                info.attemptedPercentage = Math.round(info.attempted/info.numQuestions*100);
                info.attemptedButNotSolvedPercentage = info.attemptedPercentage - info.completedPercentage;

                exercises.push(info);
            })
        });

        //sum and update count for incomplete questions
        var count = 0;
        _.each(exercises, function (exercise) {
            count += exercise.numQuestions - exercise.solved;
        });
        Template.instance().incompleteQuestions.set(count);

        return exercises;
    },

    incompleteQuestions: function () {
        return Template.instance().incompleteQuestions.get();
    },

    exerciseDescription: function () {
        return Template.instance().exerciseDescription.get();
    },

    questions: function () {
        var questions = Template.instance().questionsFromSelectedExercise.get();
        var result = [];

        _.each(questions, function (questionId) {
            var q = {};

            var question = Questions.findOne(questionId);
            q.questionId = questionId; //required when we click the start button
            q.title = question.title;

            var attempt = Attempts.findOne({questionId: questionId, userId: Meteor.userId()}, {sort: {createdAt: -1}});
            if (attempt) {
                q.lastAttempted = attempt.history ? attempt.history[0].date: undefined; //since only the last attempt is published
                q.completed = attempt.completed;
                q.attemptId = attempt._id;
            }

            result.push(q);
        });

        return result;
    },

    selected: function () { //checks whether an exercise has been selected
        return this.description === Template.instance().exerciseDescription.get();
    }
});

Template.assignments.events({
    'click .select-btn': function (event, instance) {
        instance.questionsFromSelectedExercise.set(this.questions);
        instance.exerciseDescription.set(this.description);
    },
    'click .goto-question-btn': function (event, instance) {
        Session.set('currentExercise', Template.instance().questionsFromSelectedExercise.get());
        var questionId = this.questionId;
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
