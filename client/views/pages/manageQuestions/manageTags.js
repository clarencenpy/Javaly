Template.manageTags.onRendered(function () {
    var template = this;
    template.subscribe('allTags');
});

Template.manageTags.helpers({
    tags: function () {
        return Tags.find();
    }
});

Template.manageTags.events({
    'click .edit-btn': function () {
        var id = this._id;
        var tags = Tags.find().fetch().map(function (tag) {
            return tag.label;
        });
        swal({
            title: "Change Label",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false
        }, function (inputValue) {
            if (inputValue === false) return false;
            inputValue = inputValue.trim().toUpperCase();
            if (inputValue === "") {
                swal.showInputError("Label cannot be empty!");
                return false;
            }
            if (tags.indexOf(inputValue) >= 0) {
                swal.showInputError("Label has already been used!");
                return false;
            }
            Tags.update(id, {$set: {label: inputValue.trim()}});
            swal("Update Success!", "", "success")
        });
    },
    'click .add-btn': function () {
        var id = this._id;
        var tags = Tags.find().fetch().map(function (tag) {
            return tag.label;
        });
        swal({
            title: "Add Label",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false
        }, function (inputValue) {
            if (inputValue === false) return false;
            inputValue = inputValue.trim().toUpperCase();
            if (inputValue === "") {
                swal.showInputError("Label cannot be empty!");
                return false;
            }
            if (tags.indexOf(inputValue) >= 0) {
                swal.showInputError("Label has already been used!");
                return false;
            }
            Tags.insert({label: inputValue});
            swal("New Tag added!", "", "success")
        });
    }
});