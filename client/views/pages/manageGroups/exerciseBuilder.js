Template.exerciseBuilder.onCreated(function () {
    var template = this;
    template.authors = new ReactiveVar([]);
});

Template.exerciseBuilder.onRendered(function () {
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
});

Template.exerciseBuilder.helpers({
    tags: function () {
        return Tags.find();
    },
    authors: function () {
        return Template.instance().authors.get();
    }
});

Template.exerciseBuilder.events({

});