Template.questionSearch.onCreated(function () {
    var template = this;
    template.authors = new ReactiveVar([]);
    template.questions = new ReactiveVar([]);
    template.searchParams = new ReactiveVar({limit: 30});
    template.searching = new ReactiveVar(false);
});

Template.questionSearch.onRendered(function () {

    var template = this;

    //subscribe to tags
    template.subscribe('allTags', function () {
        Tracker.afterFlush(function () {
            //init select2
            template.$('#tags').select2({
                placeholder: 'Filter by Tags...'
            });
        })
    });


    //subscribe to authors
    Meteor.call('allContributors', function (err, res) {
        template.authors.set(res);
        Tracker.afterFlush(function () {
            //init select2
            template.$('#author').select2({
                placeholder: 'Filter by Author...',
                allowClear: true
            });
        })
    });

    // retrieve results fro search params
    template.autorun(function () {
        var searchParams = template.searchParams.get();
        if (searchParams) {
            Meteor.call('searchQuestions', searchParams, function (err, res) {
                if (!err) template.questions.set(res);
                Tracker.afterFlush(function () {
                    // Initialize fooTable
                    $('.footable').footable();
                });
                template.searching.set(false);
            });
        }
    });

});

Template.questionSearch.helpers({
    searchTags: function () {
        return Tags.find();
    },
    authors: function () {
        return Template.instance().authors.get();
    },
    questions: function () {
        return Template.instance().questions.get();
    },
    searching: function () {
        return Template.instance().searching.get();
    },
    added: function (id) {
        var selected = Session.get('selected') || [];
        return selected.indexOf(id) >= 0;
    }
});

Template.questionSearch.events({
    'click #search-btn': function (event, instance) {
        var searchParams = {};
        searchParams.title = instance.$('#title').val();
        searchParams.author = instance.$('#author').val();
        searchParams.tags = instance.$('#tags').val();
        instance.searchParams.set(searchParams);
        instance.searching.set(true);
    },

    'click .add-btn': function () {
        var selected = Session.get('selected');
        selected.push(this._id);
        Session.set('selected', selected);
    },

    'click .remove-btn': function () {
        Session.set('selected', _.without(Session.get('selected'), this._id));
    }
});