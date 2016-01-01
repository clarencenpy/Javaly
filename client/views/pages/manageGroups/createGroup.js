Template.createGroup.onCreated(function () {
    this.selectedTAs = new ReactiveVar([]);
    this.selectedStudents = new ReactiveVar([]);
});

Template.createGroup.onRendered(function () {

    var instance = this;

    //init tooltips
    this.$('[data-toggle=tooltip]').tooltip({
        container: 'body',
        html: true
    });

    //init chosen
    this.$('#student-list').chosen({
        no_results_text:'Oops, no user by that name/email!',
        width:'100%'
    }).change(function () {
        instance.selectedStudents.set($(this).val() || []);
    });

    this.$('#ta-list').chosen({
        no_results_text:'Oops, no user by that name/email!',
        width:'100%'
    }).change(function () {
        instance.selectedTAs.set($(this).val() || []);
    });
});

Template.createGroup.events({
    'click #save-settings-btn': function (event, instance) {
        if (AutoForm.validateForm('insertGroupForm')) {
            var group = {
                name: AutoForm.getFieldValue('name', 'insertGroupForm'),
                groupType: AutoForm.getFieldValue('groupType', 'insertGroupForm'),
                participants: instance.selectedStudents.get(),
                teachingTeam: instance.selectedTAs.get()
            };

            Groups.insert(group, function (err, id) {
                if (err) console.log(err);
                console.log('Group ' + id + "added");
                swal({
                    title: "Group Created!",
                    text: "If you have not started adding students or your teaching team, you may do so at the group's setting page.",
                    type: "success"
                }, function () {
                    Router.go('manageGroups');
                });
            });
        }
    }
});

Template.createGroup.helpers({
    students: function () {
        return Meteor.users.find({roles: 'student'});
    },
    tas: function () {
        return Meteor.users.find({roles: {$in: ['ta', 'instructor']}});
    },
    selectedStudents: function () {
        return Template.instance().selectedStudents.get();
    },
    selectedTAs: function () {
        return Template.instance().selectedTAs.get();
    }
});