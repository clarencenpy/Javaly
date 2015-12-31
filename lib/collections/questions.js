Questions = new Mongo.Collection('questions');

Questions.attachSchema(new SimpleSchema({
    title: {
        type: String,
        max: 50
    },

    content: {
        type: String,
        autoform: {
            afFieldInput: {
                type: 'summernote',
                settings: {
                    toolbar: [
                        ['style', ['bold', 'italic', 'underline', 'clear']],
                        ['style', ['style']],
                        ['font', ['superscript', 'subscript']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'paragraph']],
                        ['insert', ['table']],
                        ['misc', ['codeview']]
                    ]
                }
            }
        }
    },

    tags: {
        type: [String],
        autoform: {
            type: 'select2',
            afFieldInput: {
                multiple: true
            },
            options: function () {
                return _.map(Tags.find().fetch(), function (tag) {
                    return {
                        label: tag.label,
                        value: tag._id
                    }
                });
            }
        },
        defaultValue: []
    },

    classname: {
        type: String,
        max: 40,
        optional: true
    },

    methodName: {
        type: String,
        max: 40,
        optional: true
    },

    questionType: {
        type: String,
        allowedValues: ['RETURN', 'SYSTEM_OUT'],
        autoform: {
            type: "select-radio",
            options: function () {
                return [
                    {label: "Return Value", value: "RETURN"},
                    {label: "System Output", value: "SYSTEM_OUT"}
                ];
            }
        },
        optional: true
    },

    methodType: {
        type: String,
        allowedValues: ['STATIC', 'NON_STATIC'],
        autoform: {
            type: "select-radio",
            options: function () {
                return [
                    {label: "Static", value: 'STATIC'},
                    {label: "Non-Static", value: 'NON_STATIC'}
                ];
            }
        },
        optional: true
    },

    testCode: {
        type: String,
        optional: true
    },

    testCases: {
        type: [Object],
        optional: true,
        blackbox: true
    },

    verified: {
        type: Boolean,
        defaultValue: false
    },

    createdBy: {
        type: String,
        autoValue: function () {
            if (this.isInsert) {
                //check if this is a server initated action
                if (this.userId) {
                    return this.userId;
                }
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
            if (this.isUpdate || this.isInsert) {
                return new Date();
            }
        },
        denyInsert: true,
    }

}));

Tags = new Mongo.Collection('tags');

Tags.attachSchema(new SimpleSchema({
    label: {
        type: String,
        max: 20,
        unique: true
    }
}));