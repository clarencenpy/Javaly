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

    completed: {
        type: Boolean,
        defaultValue: false
    },

    status: {
        type: String,
        allowedValues: ['COMPILE_ERROR', 'PASS', 'FAIL'],
        optional:true
    },

    activeTime: {
        type: Number,
        decimal: true,
        optional: true
    },

    //increment this by solveTime everytime the doc is updated
    totalActiveTime: {
        type: Number,
        decimal: true,
        optional: true,
        autoValue: function () {
            var curActiveTime = this.field('activeTime');
            if (curActiveTime.isSet) {
                if (this.isInsert) {
                    return 0;
                } else {
                    return { $inc: curActiveTime.value };
                }
            } else {
                this.unset();
            }
        }
    },

    // Whenever the doc field is updated, automatically update a history array.
    history: {
        type: [Object],
        optional: true,
        autoValue: function() {
            var code = this.field('code');
            var status = this.field('status');
            var activeTime = this.field('activeTime');
            if (code.isSet && status.isSet && activeTime.isSet) {
                if (this.isInsert) {
                    return [{
                        date: new Date,
                        code: code.value,   //use .value as code is an object (see docs)
                        status: status.value,
                        activeTime: activeTime.value
                    }];
                } else {    //this is update
                    return {
                        $push: {
                            date: new Date,
                            code: code.value,
                            status: status.value,
                            activeTime: activeTime.value
                        }
                    };
                }
            } else {
                this.unset();
            }
        }
    },
    'history.$.date': {
        type: Date,
        optional: true
    },
    'history.$.code': {
        type: String,
        optional: true
    },
    'history.$.status': {
        type: String,
        optional: true
    },
    'history.$.activeTime': {
        type: Number,
        decimal: true,
        optional: true
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
        denyInsert: true
    }


}));