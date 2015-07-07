Template.exerciseListing.helpers({
    completedPercentage: function () {
        var exercise = this;
        var count = 0;
        var group = Template.parentData(1);
        _.each(group.participants, function (userId) {
            _.each(exercise.questions, function (questionId) {
                var attempt = Attempts.findOne({userId: userId, questionId: questionId});
                if (attempt && attempt.result && attempt.result.success) {
                    count++;
                }
            });
        });

        var total = group.participants.length * exercise.questions.length;

        return Math.round(count/total*100);
    }
});