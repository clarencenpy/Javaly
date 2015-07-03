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
        defaultValue: []
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

    'exercises.$.description': {
        type: String
    },

    'exercises.$.questions' : {
        type: [String], //questionIds
        defaultValue: []
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
    }
}));