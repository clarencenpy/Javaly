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
                        ['style', ['style']],
                        ['style', ['bold', 'italic', 'underline', 'clear']],
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
            type: 'tags',
            afFieldInput: {
                maxTags: 5,
                trimValue: true
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

    //commented out as this was causing problems - trimming white spaces even when trim is false
    //'testCases.$.description': {
    //    type: String,
    //    optional: true
    //},
    //
    //'testCases.$.prepCode': {
    //    type: String,
    //    optional: true
    //},
    //
    //'testCases.$.input': {
    //    type: String,
    //    optional: true
    //},
    //
    //'testCases.$.output': {
    //    type: String,
    //    optional: true,
    //    trim: false
    //},
    //
    //'testCases.$.visibility': {
    //    type: String,
    //    allowedValues: ['SHOW', 'HIDDEN'],
    //    optional: true
    //},

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