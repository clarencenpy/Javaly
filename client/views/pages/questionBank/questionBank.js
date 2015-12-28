Template.questionBank.onCreated(function () {
    var template = this;
    template.questions = new ReactiveVar([]);
});

Template.questionBank.onRendered(function () {

    var template = this;

    template.autorun(function () {
        var searchParams = Session.get('searchParams');
        if (searchParams) {
            Meteor.call('searchQuestions', searchParams, function (err, res) {
                if (!err) template.questions.set(res);
                Tracker.afterFlush(function () {
                    // Initialize fooTable
                    $('.footable').footable();
                });
                Session.set('searching', false);
            });
        }
    });

});

Template.questionBank.helpers({
    questions: function () {
        return Template.instance().questions.get();
    },
    searching: function () {
        return Session.get('searching');
    }
});