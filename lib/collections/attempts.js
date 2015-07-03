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

    result: {
        type: Object,
        blackbox: true,
        optional:true
    },

    solveTime: {
        type: Number,
        optional: true
    },

    //increment this by solveTime everytime the doc is updated
    totalSolveTime: {
        type: Number,
        optional: true,
        autoValue: function () {
            var curSolveTime = this.field('solveTime');
            if (curSolveTime.isSet) {
                if (this.isInsert) {
                    return 0;
                } else {
                    return { $inc: curSolveTime.value };
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
            var result = this.field('result');
            //var solveTime = this.field('solveTime');
            if (code.isSet && result.isSet) {
                if (this.isInsert) {
                    return [{
                        date: new Date,
                        code: code.value,   //use .value as code is an object (see docs)
                        result: result.value,
                        //solveTime: solveTime.value
                    }];
                } else {    //this is update
                    return {
                        $push: {
                            date: new Date,
                            code: code.value,
                            result: result.value,
                            //solveTime: solveTime.value
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
    'history.$.result': {
        type: Object,
        blackbox: true,
        optional: true
    },
    'history.$.solveTime': {
        type: Number,
        optional: true
    }


}));