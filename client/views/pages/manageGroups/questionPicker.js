Template.questionPicker.onCreated(function () {
    var instance = this;
    instance.tagsFilter = new ReactiveVar();
});

Template.questionPicker.onRendered(function () {
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
                var order = Session.get('selectedQuestions');
                return order ? order.split('|') : [];
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

Template.questionPicker.helpers({
    questions: function () {
        return Questions.find();
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

Template.questionPicker.onDestroyed(function () {
    Session.set('selectedQuestions', null);
});