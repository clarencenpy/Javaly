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
        max: 20
    },

    testCode: {
        type: String,
        optional: true
    },

    test: {
        type: Object,
        blackbox: true,
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