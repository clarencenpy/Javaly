Template.exerciseListing.onCreated(function () {

    var instance = this;
    instance.completedPercentage = new ReactiveVar();
    instance.attemptedButNotCompletedPercentage = new ReactiveVar();

    this.autorun(function () {
        var exercise = instance.data;
        var group = Template.parentData(1);
        var completed = 0;
        var attempted = 0;
        _.each(group.participants, function (userId) {
            _.each(exercise.questions, function (questionId) {
                var attempt = Attempts.findOne({userId: userId, questionId: questionId});
                if (attempt && attempt.history) {  //have attempted before
                    attempted++;
                    if (attempt.result.success){
                        completed++;
                    }
                }
            });
        });

        var total = group.participants.length * exercise.questions.length;
        instance.completedPercentage.set(Math.round(completed/total*100));
        instance.attemptedButNotCompletedPercentage.set(Math.round((attempted-completed)/total*100));

    });
});



Template.exerciseListing.helpers({
    completedPercentage: function () {
        return Template.instance().completedPercentage.get();
    },
    attemptedButNotCompletedPercentage: function () {
        return Template.instance().attemptedButNotCompletedPercentage.get();
    }
});