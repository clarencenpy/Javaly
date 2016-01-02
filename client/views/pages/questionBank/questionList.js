Template.questionList.events({
    'click .add-btn': function () {
        var selected = Session.get('selected');
        selected.push(this._id);
        Session.set('selected', selected);
    },

    'click .remove-btn': function () {
        Session.set('selected', _.without(Session.get('selected'), this._id));
    }
});

Template.questionList.helpers({
    added: function (id) {
        var selected = Session.get('selected') || [];
        return selected.indexOf(id) >= 0;
    }
});
