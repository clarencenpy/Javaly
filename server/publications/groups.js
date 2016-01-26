Meteor.publish('myGroups', function () {
    if (Roles.userIsInRole(this.userId, ['admin'])) {
        return Groups.find();
    } else {
        return Groups.find({$or: [{createdBy: this.userId}, {teachingTeam: this.userId}]});
    }
});

Meteor.publishComposite('allGroups', {
    find: function () {
        return Groups.find();
    },
    children: [
        {
            find: function (topLevelDoc) {
                return Meteor.users.find({
                    $or: [
                        {_id: topLevelDoc.createdBy},
                        {_id: {$in: topLevelDoc.teachingTeam}}
                    ]
                }, {
                    fields: {'profile.name': 1}
                });
            }
        }
    ]
});

//Used in: joinGroups
Meteor.publishComposite('availableGroups', {
    find: function () {
        return Groups.find({groupType: {$in: ['OPEN', 'ACCEPT_REQUEST', 'PRIVATE']}});
    },
    children: [
        {
            find: function (topLevelDoc) {
                return Meteor.users.find({
                    $or: [
                        {_id: topLevelDoc.createdBy},
                        {_id: {$in: topLevelDoc.teachingTeam}}
                    ]
                }, {
                    fields: {'profile.name': 1}
                });
            }
        }
    ]
});

//TODO: should we do more checks to ensure that user has access to that group?
Meteor.publish('group', function (groupId) {
    return Groups.find(groupId);
});

Groups.allow({
    insert: function (userId, doc) {
        return userId && Roles.userIsInRole(userId, ['instructor', 'admin']);
    },
    update: function (userId, doc, fields) {
        return Roles.userIsInRole(userId, ['admin']) || doc.createdBy === userId || (_.indexOf(doc.teachingTeam, userId) >= 0 && _.without(fields, 'exercises', 'updatedAt').length === 0);
    },
    remove: function (userId, doc) {
        return Roles.userIsInRole(userId, ['admin']) || doc.createdBy === userId;
    }
});

// Methods for managing exercises
Meteor.methods({
    setExerciseVisibility: function (groupId, exerciseId, show) {
        //only the teaching team can update exercise
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }


        var group = Groups.findOne(groupId);
        var isTeachingTeam = _.find(group.teachingTeam, function (id) {
            return id === Meteor.userId();
        });
        if (group.createdBy !== Meteor.userId() && !isTeachingTeam) {
            throw new Meteor.Error(403, 'Access Denied');
        }

        Groups.update({_id: groupId, 'exercises._id': exerciseId}, {
            $set: {
                'exercises.$.show': show
            }
        })
    },

    updateExercise: function (description, questions, groupId, exerciseId) {
        //only the teaching team can update exercise
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }


        var group = Groups.findOne(groupId);
        var isTeachingTeam = _.find(group.teachingTeam, function (id) {
            return id === Meteor.userId();
        });
        if (group.createdBy !== Meteor.userId() && !isTeachingTeam) {
            throw new Meteor.Error(403, 'Access Denied');
        }

        Groups.update({_id: groupId, 'exercises._id': exerciseId}, {
            $set: {
                'exercises.$.description': description,
                'exercises.$.questions': questions,
                'exercises.$.updatedAt': new Date()
            }
        });

    },

    deleteExercise: function (groupId, exerciseId) {
        //only the teaching team can update exercise
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        var group = Groups.findOne(groupId);
        var isTeachingTeam = _.find(group.teachingTeam, function (id) {
            return id === Meteor.userId();
        });
        if (group.createdBy !== Meteor.userId() && !isTeachingTeam) {
            throw new Meteor.Error(403, 'Access Denied');
        }

        Groups.update(groupId, {
            $pull: {'exercises': {_id: exerciseId}}
        });
    }
});

// Methods for managing participants in groups
Meteor.methods({
    requestJoinGroup: function (groupId) {
        //students can request to join groups
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        var groupType = Groups.findOne(groupId).groupType;

        if (groupType === 'OPEN') {
            Groups.update(groupId, {
                $push: {
                    participants: Meteor.userId()
                }
            });
        }

        if (groupType === 'ACCEPT_REQUEST') {
            Groups.update(groupId, {
                $push: {
                    pendingParticipants: Meteor.userId()
                }
            });
        }
    },

    leaveGroup: function (groupId) {
        //students may leave group, TODO: send a notification to instructor
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        //this method can also be used to withdraw request
        Groups.update(groupId, {
            $pull: {
                participants: Meteor.userId(),
                pendingParticipants: Meteor.userId()
            }
        });
    },

    addStudentToGroup: function (userId, groupId) {
        //only members from the teaching team can accept requests
        if (!Meteor.userId()) {
            throw new Meteor.Error(403, 'Not Logged In');
        }

        var group = Groups.findOne(groupId);
        var isTeachingTeam = _.find(group.teachingTeam, function (id) {
            return id === Meteor.userId();
        });
        if (group.createdBy !== Meteor.userId() && !isTeachingTeam) {
            throw new Meteor.Error(403, 'Access Denied');
        }

        //remove from pendingParticipants if present
        var pending = _.find(group.pendingParticipants, function (id) {
            return id === userId;
        });
        if (pending) {
            Groups.update(groupId, {
                $pull: {
                    pendingParticipants: userId
                }
            });
        }

        //add to participants
        var alreadyAdded = _.find(group.participants, function (id) {
            return id === userId;
        });
        if (!alreadyAdded) {
            Groups.update(groupId, {
                $push: {
                    participants: userId
                }
            });
        }
    },

    rejectRequest: function (userId, groupId) {
        //remove from pendingParticipants
        Groups.update(groupId, {
            $pull: {
                pendingParticipants: userId
            }
        })
    }
});