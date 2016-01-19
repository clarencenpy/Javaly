var db = new DirectCollection('ops');

Meteor.methods({
    getOps: function (attemptId) {
        return db.findToArray({'_id.doc': attemptId});
    }
});