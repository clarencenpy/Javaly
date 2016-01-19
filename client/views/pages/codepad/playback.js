Template.playback.onRendered(function () {
    var template = this;

    var attemptId = template.data.attemptId;
    Meteor.call('getOps', attemptId, function (err, res) {
        console.log(res);
    });

    template.$('#slider').slider({
        formatter: function(value) {
            return value;
        }
    });
});
