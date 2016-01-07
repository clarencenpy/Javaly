Template.exerciseBuilder.onCreated(function () {
    var template = this;
    var exercise = _.find(template.data.exercises, function (exercise) {
        return exercise._id === Router.current().params.exerciseId;
    });
    Session.set('selected', exercise.questions || []);

    //for validation
    template.descriptionError = new ReactiveVar(false);
});

Template.exerciseBuilder.onRendered(function () {
    var template = this;

    template.sortable = Sortable.create(template.find('#sortable'), {
        dataIdAttr: 'data-id',
        animation: 150,
        filter: 'i',
        store: {
            get: function (sortable) {
                return Session.get('selected');
            },
            set: function (sortable) {

            }
        }
    });

});

Template.exerciseBuilder.helpers({
    description: function () {
        var exercise = _.find(Template.currentData().exercises, function (exercise) {
            return exercise._id === Router.current().params.exerciseId;
        });
        return exercise.description;
    },
    selectedQuestions: function () {
        return Session.get('selected');
    },
    getQuestionTitle: function (id) {
        return Questions.findOne(id).title;
    },
    searchParams: function () {
        return {limit: 30};  //set limit to number of questions allowed to load
    },
    descriptionError: function () {
        return Template.instance().descriptionError.get();
    }
});

Template.exerciseBuilder.events({
    'click #save-btn': function (event, instance) {
        var questions = instance.sortable.toArray() || [];
        var description = instance.$('input[name=description]').val();
        if (!description) {
            instance.descriptionError.set(true);
            return;
        }
        Meteor.call('updateExercise', description, questions, Router.current().params.groupId, Router.current().params.exerciseId, function (err, res) {
            if (err) {
                console.log(err);
            } else {
                swal({
                    title: "Exercise Saved!",
                    text: "Students enrolled in this group may now have access to the questions you have selected",
                    type: "success",
                    allowEscapeKey: true,
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
    },

    'click .remove-btn': function () {
        Session.set('selected', _.without(Session.get('selected'), this.toString()));
    }
});

Template.exerciseBuilder.onDestroyed(function () {
    Session.set('selected', undefined);
});