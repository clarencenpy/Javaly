Template.updateGroup.onCreated(function () {
    var selectedTAs = Template.currentData().teachingTeam || [];
    var selectedStudents = Template.currentData().participants || [];
    this.selectedTAs = new ReactiveVar(selectedTAs);
    this.selectedStudents = new ReactiveVar(selectedStudents);
});

Template.updateGroup.onRendered(function () {
    this.$('[data-toggle=tooltip]').tooltip({
        container: 'body',
        html: true
    });

    var instance = this;

    //init chosen
    this.$('#student-list').chosen({
        no_results_text:'Oops, no user by that name/email!',
        width:'100%'
    }).change(function () {
        instance.selectedStudents.set($(this).val());
    });

    this.$('#ta-list').chosen({
        no_results_text:'Oops, no user by that name/email!',
        width:'100%'
    }).change(function () {
        instance.selectedTAs.set($(this).val());
    });
});


Template.updateGroup.events({
    'click #update-settings-btn': function (event, instance) {
        if (AutoForm.validateForm('updateGroupForm')) {
            Groups.update(Template.currentData()._id, {
                $set: {
                    name: AutoForm.getFieldValue('name', 'updateGroupForm'),
                    groupType: AutoForm.getFieldValue('groupType', 'updateGroupForm'),
                    participants: instance.selectedStudents.get(),
                    teachingTeam: instance.selectedTAs.get()
                }
            },function (err) {
                if (err) console.log(err);
                swal({
                    title: "Group Updated!",
                    type: "success"
                }, function () {
                    Router.go('manageGroups');
                });
            });
        }
    }
});

Template.updateGroup.helpers({
    students: function () {
        var allStudents = Meteor.users.find({roles: 'student'}).fetch();
        var enrolledStudents = Template.currentData().participants;
        return _.map(allStudents, function (student) {
            var match = _.find(enrolledStudents, function (enrolled) {
                return enrolled === student._id;
            });
            if (match) {
                //adds a new attribute
                student.selected = true;
            }
            return student;
        });
    },
    tas: function () {
        var allTAs = Meteor.users.find({roles: {$in: ['ta', 'instructor']}}).fetch();
        var currentTAs =  Template.currentData().teachingTeam;
        return _.map(allTAs, function (ta) {
            var match = _.find(currentTAs, function (current) {
                return current === ta._id;
            });
            if (match) {
                //adds a new attribute
                ta.selected = true;
            }
            return ta;
        });
    },
    selectedStudents: function () {
        return Template.instance().selectedStudents.get();
    },
    selectedTAs: function () {
        return Template.instance().selectedTAs.get();
    }
});