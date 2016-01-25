Meteor.publishComposite('assignments', {
    find: function () {
        return Groups.find({participants: this.userId}, {
            fields: {
                name: 1,
                participants: 1,
                exercises: 1,
                createdBy: 1
            },
            sort: {createdAt: -1}
        });
    },
    children: [
        {
            find: function (group) {
                return Meteor.users.find(group.createdBy, {
                    fields: {
                        'profile.name': 1
                    }
                })
            }
        },
        {
            //publishing all the questions the student should have access to
            find: function (group) {
                var questions = [];
                _.each(group.exercises, function (exercise) {
                    if (exercise.show) {
                        questions = questions.concat(exercise.questions);
                    }
                });
                return Questions.find({_id: {$in: questions}}, {
                    fields: {
                        title: 1
                    }
                });
            },
            children: [
                {
                    //for each question, publish all the attempts
                    find: function (question) {
                        return Attempts.find({questionId: question._id, userId: this.userId}, {
                            fields: {
                                questionId: 1,
                                userId: 1,
                                completed: 1,
                                history: {$slice: -1}, //return only the history of the most recent attempt (to get lastAttempt date)
                                'history.date': 1,
                                updatedAt: 1
                            }
                        });
                    }
                }
            ]
        }
    ]

});