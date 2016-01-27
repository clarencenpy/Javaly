Template.exerciseDashboard.onCreated(function () {
    var template = this;
    template.sortBy = new ReactiveVar('completeCount');
    template.reverse = new ReactiveVar(true);
    template.completedPercentage = new ReactiveVar();
    template.attemptedPercentage = new ReactiveVar();

    //for sending nudge jobs
    template.loadingJobs = new ReactiveVar(false);
    template.nudgeJobs = new ReactiveVar();
});

Template.exerciseDashboard.onRendered(function () {
    var template = this;

    //use Blaze.renderWithData to inject the html in, in order to force a full update
    template.autorun(function () {
        var group = Groups.findOne(Router.current().params.groupId);
        if (group) {    //subs should be ready

            var exercise = _.find(group.exercises, function (exercise) {
                return Router.current().params.exerciseId === exercise._id;
            });

            //also the ordering in which to display the questions
            var questions = exercise.questions;

            //map questions to aggregate attempts by student
            //i am using an object here so that i can perform sorting based on the questionId
            //subsequently, i can restore the ordering using questions above as reference

            //overall stats
            var totalCompleted = 0;
            var totalAttempted = 0;

            var result = _.map(group.participants, function (userId) {
                var student = {}; //an object with all the questionId as keys
                var completeCount = 0;
                var attemptCount = 0;
                _.each(questions, function (questionId) {
                    var attempt = Attempts.findOne({questionId: questionId, userId: userId}, {sort: {createdAt: -1}});
                    var data = {};
                    if (attempt) {
                        if (attempt.completed) {
                            data.status = 'A_COMPLETED';
                            completeCount++;
                            totalCompleted++;
                        } else {
                            data.status = 'B_ATTEMPTED';
                            attemptCount++;
                            totalAttempted++;
                        }
                        if (attempt._id === Meteor.user().profile.activeAttempt) {
                            data.active = true;
                        }

                        data.attemptId = attempt._id;
                    } else {
                        data.status = 'C_UNATTEMPTED';
                    }
                    student[questionId] = data;
                    student.completeCount = completeCount;
                    student.attemptCount = attemptCount;
                    student.name = Meteor.users.findOne(userId).profile.name;
                });
                return student;
            });

            var sortBy = Template.instance().sortBy.get();
            if (sortBy === 'completeCount') {
                result = _.sortBy(result, 'completeCount');
            } else {
                result = _.sortBy(result, function (student) {
                    return student[sortBy].status;
                });
            }

            var reverse = Template.instance().reverse.get();
            if (reverse) {
                result.reverse();
            }

            //transform it from array[obj] into array[array], using the question order
            result = _.map(result, function (student) {
                var arr = [];
                arr.push(student.name);
                arr.push(student.completeCount);
                _.each(questions, function (questionId) {
                    arr.push(student[questionId]);
                });
                return arr;
            });

            //update the ui
            template.$('tbody').empty();
            Blaze.renderWithData(Template.exerciseStatsTable, result, template.$('tbody').get()[0]);
            //console.log(JSON.stringify(result, null, 2));

            //update the overall stats
            var totalAttempts = questions.length * group.participants.length;
            template.completedPercentage.set(Math.round(totalCompleted / totalAttempts * 100));
            template.attemptedPercentage.set(Math.round(totalAttempted / totalAttempts * 100));
        }
    });
});

Template.exerciseDashboard.helpers({

    headers: function () {
        var group = Groups.findOne(Router.current().params.groupId);
        if (group) {    //subs should be ready
            var exercise = _.find(group.exercises, function (exercise) {
                return Router.current().params.exerciseId === exercise._id;
            });
            return exercise.questions;
        }
    },

    getTitle: function (id) {
        return Questions.findOne(id).title;
    },

    info: function () {
        var info = {};
        var group = Groups.findOne(Router.current().params.groupId);
        if (group) {    //subs should be ready
            var exercise = _.find(group.exercises, function (exercise) {
                return Router.current().params.exerciseId === exercise._id;
            });
            info.exerciseDescription = exercise.description;
            info.groupName = group.name;
        }
        return info;
    },

    completedPercentage: function () {
        return Template.instance().completedPercentage.get();
    },

    attemptedPercentage: function () {
        return Template.instance().attemptedPercentage.get();
    }

});

Template.exerciseDashboard.events({
    'click .sort-btn': function (event, instance) {
        var questionId = this.toString();
        var originalQuestionId = instance.sortBy.get();
        if (questionId === originalQuestionId) {
            instance.reverse.set(!instance.reverse.get());
        } else {
            instance.sortBy.set(questionId);
        }
    },
    'click .sort-completed-btn': function (event, instance) {
        var original = instance.sortBy.get();
        if (original === 'completeCount') {
            instance.reverse.set(!instance.reverse.get());
        } else {
            instance.sortBy.set('completeCount');
        }
    },

    'click #boxplot-btn': function (event, instance) {

        var target = instance.$('#boxplot');
        Meteor.call('boxplot', Router.current().params.groupId, Router.current().params.exerciseId, function (err, res) {
            renderBoxplot(res, target, {showAllStudents: true});
        });
    },

    'click #nudge-btn': function (event, instance) {
        //allow the instructor to verify the emails that is going to be sent
        instance.loadingJobs.set(true);
        Meteor.call('nudge', Router.current().params.groupId, Router.current().params.exerciseId, 30, {sendToUnsolved: true},function (err, res) {
            instance.nudgeJobs.set(res);
            instance.loadingJobs(false);
        });
    },

    'click #send-nudge-btn': function (event, instance) {
        //send the emails after confirmation

        //needed for creating the email subject
        var group = Groups.findOne(Router.current().params.groupId);
        var exercise = _.find(group.exercises, function (exercise) {
            if (exercise._id === Router.current().params.exerciseId) return exercise;
        });

        var mail = {
            subject: 'Review your work: ' + group.name + ' - ' + exercise.description,
            jobs: instance.nudgeJobs.get(),
            message: message,
            sender: Meteor.user().profile.name
        };
        Meteor.call('sendNudgeEmails', mail, function (err, res) {
            if (err) console.log(err);
            swal('Sent Successfully', '', 'success');
        });
        instance.nudgeJobs.set(null);
    }
});

Template.exerciseDashboard.onDestroyed(function () {
    Session.set('selectedAttempt', null);
});

renderBoxplot = function (data, target, options) {

    if (options === undefined) {
        options = {};
    }
    /** possible options:
     *
     * showAllStudents: if true, legends will be shown and lines will become bold only on hover
     */


    var series = [];

    //add the boxplot
    series.push({
        type: 'boxplot',
        showInLegend: false,
        data: data.boxplot,
        tooltip: {
            headerFormat: '<b>{point.key}</b><br/>',
            pointFormat: 'Solved: {point.statusText} <br>' +
            'Max: {point.high}<br/>' +
            'Upper: {point.q3}<br/>' +
            'Median: {point.median}<br/>' +
            'Lower: {point.q1}<br/>' +
            'Min: {point.low}'

        }
    });

    _.each(data.lines, function (line) {
        series.push({
            type: 'line',
            showInLegend: !!options.showAllStudents,
            name: line.name,
            data: line.data,
            tooltip: {
                pointFormat: '<b>{series.name}</b>: {point.y}s'
            }
        })
    });

    var highchartsOptions = {
        title: {
            text: 'Solve Statistics'
        },
        credits: false,
        xAxis: {
            categories: data.questionTitles,
            title: {
                text: 'Questions'
            }
        },
        yAxis: {
            title: {
                text: 'Solve time (s)'
            }
        },
        plotOptions: {
            boxplot: {
                fillColor: '#F0F0E0',
                lineWidth: 2,
                medianColor: '#0C5DA5',
                medianWidth: 3,
                stemColor: '#A63400',
                stemDashStyle: 'dot',
                stemWidth: 1,
                whiskerColor: '#3D9200',
                whiskerLength: '20%',
                whiskerWidth: 3,
                animation: false
            },
            line: {
                connectNulls: true,
                lineWidth: options.showAllStudents ? 0.3 : 5,
                states: {hover: {lineWidth: 4}},
                marker: {
                    radius: 0,
                    symbol: 'circle',
                    states: {hover: {radiusPlus: options.showAllStudents ? 5 : 0}}
                },
                color: 'orange',
                animation: false
            }
        },
        series: series
    };

    if (options.showAllStudents) {
        highchartsOptions.legend = {
            title: {
                text: 'Hover to highlight',
                style: {fontStyle: 'italic', fontWeight: 'normal'}
            },
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            itemHoverStyle: {
                color: 'orange'
            }
        }
    }

    target.highcharts(highchartsOptions);

    //needs a resize event in order to render at the 100% width of parent
    Meteor.setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
    },1);
    Meteor.setTimeout(function () {
        window.dispatchEvent(new Event('resize'));
    },100);
};