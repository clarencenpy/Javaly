Meteor.publishComposite('exerciseDashboard', function (groupId, exerciseId) {
    return {
        find: function () {
            return Groups.find(groupId);
        },
        children: [
            {
                //publishing Attempts with all possible combinations of userId-questionId
                find: function (group) {    //topLevelDoc
                    var exercise = _.find(group.exercises, function (exercise) {
                        return exerciseId === exercise._id;
                    });
                    var questions = exercise.questions;
                    var students = group.participants;
                    return Attempts.find({$and: [{questionId: {$in: questions}}, {userId: {$in: students}}]}, {fields: {
                        questionId: 1,
                        userId: 1,
                        totalActiveTime: 1,
                        completed: 1,
                        //'history.date': 1,
                        updatedAt: 1,
                        createdAt: 1
                    }});
                }
            },
            {
                //publishing question titles
                find: function (group) {
                    var exercise = _.find(group.exercises, function (exercise) {
                        return exerciseId === exercise._id;
                    });
                    return Questions.find({_id: {$in: exercise.questions}}, {fields: {
                        title: 1
                    }});
                }
            },
            {
                //publish student info
                find: function (group) {
                    return Meteor.users.find({_id: {$in: group.participants}}, {fields: {
                        'profile.name': 1
                    }})
                }
            }
        ]
    }
});

Meteor.methods({
    history: function (attemptId) {
        return Attempts.findOne(attemptId, {fields: {
            history: 1
        }});
    },
    boxplot: function (groupId, exerciseId, queryUserId) {

        //queryUserId is provided if called by a student, only returns a single student's data and the boxplot stats

        var group = Groups.findOne({_id: groupId}, {fields: {
            exercises: 1,
            participants: 1
        }});
        var exercise = _.find(group.exercises, function (exercise) {
            if (exercise._id === exerciseId) return exercise;
        });
        var boxplotMatrix = [];
        var questionTitles = [];
        var studentMatrix = {};

        _.each(exercise.questions, function (questionId) {
            var solveTimesForQuestion = [];
            _.each(group.participants, function (userId) {
                var attempt = Attempts.findOne({questionId: questionId, userId: userId}, {
                    fields: {
                        completed: 1,
                        totalActiveTime: 1
                    },
                    sort: {createdAt: -1}
                });

                var name = Meteor.users.findOne(userId).profile.name;
                var solveTime = null;
                if (attempt && attempt.completed) { //note: this calculation ignores uncompleted attempts
                    solveTime = Math.round(attempt.totalActiveTime * 10) / 10;
                    solveTimesForQuestion.push(solveTime);
                }
                if (queryUserId === undefined || queryUserId === userId) {
                    if (studentMatrix[name] === undefined) {
                        studentMatrix[name] = [solveTime];
                    } else {
                        studentMatrix[name].push(solveTime);
                    }
                }

            });
            questionTitles.push(Questions.findOne(questionId).title);
            var boxValues = getBoxValues(solveTimesForQuestion);
            //append additional info about how many students solved it
            boxValues.statusText = solveTimesForQuestion.length + '/' + group.participants.length;
            boxplotMatrix.push(boxValues);
        });


        //some data transformation to suit highcharts
        studentMatrix = _.map(studentMatrix, function (arr, key) {
            return {
                name: key,
                data: arr
            }
        });
        return {
            boxplot: boxplotMatrix,
            questionTitles: questionTitles,
            lines: studentMatrix
        };
    },
    nudge: function (groupId, exerciseId, percentile, options) {

        if (options === undefined) {
            options = {};
        }

        var mailList = {};

        var group = Groups.findOne(groupId);
        var exercise = _.find(group.exercises, function (exercise) {
            if (exercise._id === exerciseId) return exercise;
        });
        if (exercise === undefined) return;

        //collate array of solveTime per question
        var questionTimings = {};

        _.each(exercise.questions, function (questionId) {

            var timings = [];

            _.each(group.participants, function (userId) {
                var attempt = Attempts.findOne({questionId: questionId, userId: userId}, {
                    fields: {
                        completed: 1,
                        totalActiveTime: 1
                    },
                    sort: {createdAt: -1}
                });

                if (attempt && attempt.completed) { //note: this calculation ignores uncompleted attempts
                    var solveTime = Math.round(attempt.totalActiveTime * 10) / 10;
                    timings.push({userId: userId, solveTime: solveTime});
                } else {
                    if (options.sendToUnsolved) {
                        if (mailList[userId] === undefined) {
                            mailList[userId] = {unsolved: [questionId]}
                        } else {
                            mailList[userId].unsolved.push(questionId);
                        }
                    }
                }
            });

            questionTimings[questionId] = timings;
        });

        //sort the timings and figure out target students by percentile
        var sortedQuestionTimings = {};
        _.each(questionTimings, function (timings, questionId) {
            sortedQuestionTimings[questionId] = _.sortBy(timings, 'solveTime').reverse();
        });

        _.each(sortedQuestionTimings, function (timings, questionId) {
            var numToSend = Math.round(timings.length * (percentile / 100));
            for (var i=0; i<numToSend; i++) {
                var timing = timings[i];
                if (mailList[timing.userId] === undefined) {
                    mailList[timing.userId] = {retry: [questionId]}
                } else {
                    var mail = mailList[timing.userId];
                    if (mail.retry === undefined) {
                        mail.retry = [questionId];
                    } else {
                        mail.retry.push(questionId);
                    }
                }
            }
        });

        //keep a record of all question objects, to reduce duplicate database queries
        var questionList = Questions.find({_id : {$in: exercise.questions}}, {fields: {title: 1}}).fetch();

        var mailJobs = _.map(mailList, function (contents, userId) {
            var user = Meteor.users.findOne({_id: userId}, {fields: {
                'profile.name': 1,
                emails: {$slice: -1},
                'services.google.email': 1
            }});
            return {
                name: user.profile.name,
                email: process.env.NODE_ENV === 'development' ? user.emails[0].address : user.services.google.email,
                unsolved: _.map(contents.unsolved, function (questionId) {
                    return _.find(questionList, function (q) {
                        return q._id === questionId;
                    })
                }),
                retry: _.map(contents.retry, function (questionId) {
                    return _.find(questionList, function (q) {
                        return q._id === questionId;
                    })
                })
            }
        });
        //console.log(JSON.stringify(mailJobs, null, 2));
        return mailJobs;
    }
});


function getBoxValues(data) {
    if (data.length === 0) {
        return {};

    }
    return {
        low: Math.round(Math.min.apply(Math,data) * 10) / 10,
        q1: Math.round(getPercentile(data, 25) * 10) / 10,
        median: Math.round(getPercentile(data, 50) * 10) / 10,
        q3: Math.round(getPercentile(data, 75) * 10) / 10,
        high: Math.round(Math.max.apply(Math,data) * 10) / 10
    }
}
//get any percentile from an array
function getPercentile(data, percentile) {
    data.sort(numSort);
    var index = (percentile/100) * data.length;
    var result;
    if (Math.floor(index) == index) {
        result = (data[(index-1)] + data[index])/2;
    }
    else {
        result = data[Math.floor(index)];
    }
    return result;
}
//get the mean of an array of numbers
function mean(data) {
    var len = data.length;
    var sum = 0;
    for(var i = 0; i < len; i++) {
        sum += parseFloat(data[i]);
    }
    return (sum / len);
}
//because .sort() doesn't sort numbers correctly
function numSort(a,b) {
    return a - b;
}