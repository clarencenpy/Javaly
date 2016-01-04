Groups = new Mongo.Collection('groups');

Groups.attachSchema(new SimpleSchema({
    name: {
        type: String,
        label: 'Name',
        max: 50
    },

    groupType: {
        type: String,
        allowedValues: ['OPEN', 'PRIVATE', 'ACCEPT_REQUEST'],
        autoform: {
            type: "select-radio",
            options: function () {
                return [
                    {label: "Open Group", value: "OPEN"},
                    {label: "Private Group", value: "PRIVATE"},
                    {label: "Accept Requests", value: "ACCEPT_REQUEST"}
                ];
            }
        }
    },

    participants: {
        type: [String], //userids
        defaultValue: []
    },

    pendingParticipants: { //students who have requested to join, but not accepted
        type: [String],
        defaultValue: []
    },

    teachingTeam: {
        type: [String],
        defaultValue: []
    },

    exercises: {
        type: [Object],
        defaultValue: [],
        blackbox: true
    },

    'exercises.$.createdAt': {
        type: Date
    },
    'exercises.$.updatedAt': {
        type: Date
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