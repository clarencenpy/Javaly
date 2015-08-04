Groups = new Mongo.Collection('groups');

Groups.attachSchema(new SimpleSchema({
    name: {
        type: String,
        label: 'Name',
        max: 50
    },

    participants: {
        type: [String], //userids
        defaultValue: []
    },

    exercises: {
        type: [Object],
        defaultValue: [],
        blackbox: true,
    },

    'exercises.$.createdAt': {
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

    'exercises.$._id': {
        type: String,
        defaultValue: Random.id()
    },

    'exercises.$.description': {
        type: String,
        defaultValue: ""
    },

    'exercises.$.questions' : {
        type: [String], //questionIds
        defaultValue: []
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
    }
}));