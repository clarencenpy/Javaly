Template.editExercise.onCreated(function () {
    var instance = this;
    instance.tagsFilter = new ReactiveVar();
});

Template.editExercise.onRendered(function () {
    var instance = this;

    //generate list of tags and initialise chosen plugin
    var tags = [];
    var questions = Questions.find().fetch();
    _.each(questions, function (question) {
        tags = tags.concat(question.tags);
    });
    tags = _.uniq(tags);

    var $chosen = this.$('.chosen-select');
    _.each(tags, function (tag) {
        $chosen.append('<option value="' + tag + '">' + tag + '</option>');
    });

    $chosen.chosen({
        max_selected_options: 5
    }).change(function () {
        var selected = $(this).val();
        instance.tagsFilter.set(selected);
    });


    var pickedSortable = Sortable.create(this.find('#picked'), {
        group: 'questions',
        dataIdAttr: 'data-id',
        store: {
            get: function (sortable) {
                var exercise = _.find(Template.currentData().exercises, function (exercise) {
                    return exercise._id === Router.current().params.exerciseId;
                });
                return exercise.questions;
            },
            set: function (sortable) {
                var order = sortable.toArray();
                Session.set('selectedQuestions', order.join('|'));
            }
        }
    });

    Sortable.create(this.find('#unpicked'), {
        group: 'questions',
        dataIdAttr: 'data-id',
        onEnd: function () {
            var order = pickedSortable.toArray();
            Session.set('selectedQuestions', order.join('|'));
        }
    });


});

Template.editExercise.helpers({
    description: function () {
        var exercise = _.find(Template.currentData().exercises, function (exercise) {
            return exercise._id === Router.current().params.exerciseId;
        });
        return exercise.description;
    },

    questions: function () {
        var exercise = _.find(Template.currentData().exercises, function (exercise) {
            return exercise._id === Router.current().params.exerciseId;
        });
        return Questions.find({_id: {$nin: exercise.questions}});
    },

    pickedQuestions: function () {
        var exercise = _.find(Template.currentData().exercises, function (exercise) {
            return exercise._id === Router.current().params.exerciseId;
        });
        Session.set('selectedQuestions', exercise.questions.join('|'));   //otherwise it will be empty if user clicks save immediately
        return Questions.find({_id: {$in: exercise.questions}});
    },

    filter: function (questionId) {
        var tagsFilter = Template.instance().tagsFilter.get();
        if (tagsFilter === undefined || tagsFilter === null) {
            return true;
        }
        var question = Questions.findOne(questionId);
        return _.find(question.tags, function (tag) {
            return tagsFilter.indexOf(tag) >= 0;
        });
    }
});

Template.editExercise.events({
    'click #save-btn': function (event, instance) {
        var questions = Session.get('selectedQuestions') ? Session.get('selectedQuestions').split('|') : [];
        var description = instance.$('input[name=description]').val();
        var group = Template.currentData();
        Meteor.call('updateExercise', description, questions, group._id, Router.current().params.exerciseId, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                swal({
                    title: "Exercise Saved!",
                    text: "Students enrolled in this group may now have access to the questions you have selected",
                    type: "success",
                    allowEscapeKey: false,
                    confirmButtonText: 'Ok'
                }, function () {
                    Router.go('manageGroups');
                });
            }
        })
    },
    'click #delete-btn': function () {
        swal({
            title: "Are you sure?",
            text: "This may interrupt students who have already started on the exercises",
            type: "warning",
            showCancelButton: true,
            allowEscapeKey: false,
            confirmButtonText: 'Delete'
        }, function () {
            Meteor.call('deleteExercise', Router.current().params.groupId, Router.current().params.exerciseId);
            Router.go('manageGroups');
        });
    }

});

Template.editExercise.onDestroyed(function () {
    Session.set('selectedQuestions', null);
});