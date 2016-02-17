Template.questionSearch.onCreated(function () {
    var template = this;
    template.authors = new ReactiveVar([]);
    template.questions = new ReactiveVar([]);
    template.searching = new ReactiveVar(false);

    var searchParams = template.data.searchParams || {};
    //load params from session if any
    searchParams.title = Session.get('questionSearch.title');
    searchParams.author = Session.get('questionSearch.author');
    searchParams.tags = Session.get('questionSearch.tags');
    template.searchParams = new ReactiveVar(searchParams);
});

Template.questionSearch.onRendered(function () {

    var template = this;

    //subscribe to tags
    template.subscribe('allTags', function () {
        Tracker.afterFlush(function () {
            //init select2
            var select2 = template.$('#tags').select2({
                placeholder: 'Filter tags'
            });
            select2.val(Session.get('questionSearch.tags') || []).trigger('change');
        })
    });


    //subscribe to authors
    Meteor.call('allContributors', function (err, res) {
        template.authors.set(res);
        Tracker.afterFlush(function () {
            //init select2
            var select2 = template.$('#author').select2({
                placeholder: 'Filter author',
                allowClear: true
            });
            //if state is saved from prev search, or default author is set, make sure to reflect it here
            select2.val(Session.get('questionSearch.author') || template.data.searchParams.author || '').trigger('change');
        })
    });

    // retrieve results from search params
    template.autorun(function () {
        template.searching.set(true);
        var searchParams = template.searchParams.get();
        if (template.data.verifiedOnly) searchParams.excludeUnverified = true;
        Meteor.call('searchQuestions', searchParams, function (err, res) {
            if (err) console.log(err);
            template.questions.set(res);
            Tracker.afterFlush(function () {
                // Initialize fooTable
                $('.footable').footable();
            });
            template.searching.set(false);
        });
    });

});

Template.questionSearch.helpers({
    searchTags: function () {
        return Tags.find();
    },
    title: function () {
        return Session.get('questionSearch.title');
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
        searchParams.excludeContent = instance.data.searchParams.excludeContent;
        instance.searchParams.set(searchParams);
        instance.searching.set(true);

        //save search state in Session
        Session.set('questionSearch.title', searchParams.title);
        Session.set('questionSearch.author', searchParams.author);
        Session.set('questionSearch.tags', searchParams.tags);
    }
});