Attempts = new Mongo.Collection('attempts');

Attempts.attachSchema(new SimpleSchema({

    userId: {
        type: String
    },

    questionId: {
        type: String
    },

    code: {
        type: String,
        optional: true
    },

    // Whenever the "code" field is updated, automatically
    // update a versions array.
    versions: {
        type: [Object],
        optional: true,
        autoValue: function() {
            var code = this.field('code');
            if (code.isSet) {
                if (this.isInsert) {
                    return [{
                        date: new Date,
                        code: code.value,
                        passed: false
                    }];
                } else {
                    return {
                        $push: {
                            date: new Date,
                            code: code.value,
                            passed: false
                        }
                    };
                }
            } else {
                this.unset();
            }
        }
    },
    'versions.$.date': {
        type: Date,
        optional: true
    },
    'versions.$.code': {
        type: String,
        optional: true
    },
    'versions.$.passed': {
        type: Boolean,
        optional: true
    }


}));