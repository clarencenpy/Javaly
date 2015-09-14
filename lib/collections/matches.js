Matches = new Mongo.Collection('matches');

Matches.attachSchema(new SimpleSchema({

    playerA: {
        type: Object
    },

    playerB: {
        type: Object
    }

}));