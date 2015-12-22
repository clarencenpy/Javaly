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
                        ['misc', ['codeview']],
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
        max: 20,
        optional: true
    },

    methodName: {
        type: String,
        max: 20
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
        }
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
        }
    },

    //either the Test.java code or a JSON specifying the test cases may be provided

    testCode: {
        type: String,
        optional: true
    },

    testCases: {
        type: [Object],
        optional: true,
        blackbox: true
    },

    solution: {
        type: Object,
        optional: true
    },

    'solution.code': {
        type: String,
        optional: true
    },

    'solution.release': {
        type: Boolean,
        optional: true
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
            if (this.isUpdate) {
                return new Date();
            }
        },
        denyInsert: true,
        optional: true
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