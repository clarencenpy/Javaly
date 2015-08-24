Template.roles.onRendered(function () {
    this.$('#datatable').DataTable({
        paging: false,
        info: false,
    });
});

Template.roles.helpers({
    isInstructor: function () {
        return this.roles.indexOf('instructor') >= 0;
    },
    isTA: function () {
        return this.roles.indexOf('ta') >= 0;
    },
    isStudent: function () {
        return this.roles.indexOf('student') >= 0;
    }
});

Template.roles.events({
    'click .toggle-btn': function (event) {
        Meteor.call('toggleRole', this._id, $(event.target).data('role'));
    }
});