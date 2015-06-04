Questions = new Mongo.Collection('questions');

Questions.attachSchema(new SimpleSchema({
    title: {
        type: String,
        label: 'Title',
        max: 50
    },

    content: {
        type: String,
        label: 'Content',
        autoform: {
            afFieldInput: {
                type: 'summernote',
                settings: {
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline', 'clear']],
                        ['font', ['strikethrough', 'superscript', 'subscript']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['height', ['height']]
                    ]
                }

            }
        }
    },

    createdBy: {
        type: String,
        autoValue: function () {
            if (this.isInsert) {
                return this.userId;
            } else {
                this.unset();
            }
        }

    },

    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date};
            } else {
                this.unset();
            }
        }
    },

    updatedAt: {
        type: Date,
        autoValue: function() {
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
    },

    uploaded: {
        type: Boolean,
        defaultValue: false
    },

    checked: {
        type: Boolean,
        defaultValue: false
    }

}));

//Meteor.methods({
//    questionInsert: function (postAttributes) {
//        check(Meteor.userId(), String);
//        check(postAttributes: {
//
//        });
//
//        var user = Meteor.user();
//
//    }
//})