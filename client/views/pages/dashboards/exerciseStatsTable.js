Template.exerciseStatsTable.helpers({
    display: function (x) {
        if (typeof x === 'number' || typeof x === 'string') return x;
        if (x.status === 'A_COMPLETED') return '<a class="fa fa-check fa-lg view-code-btn" data-toggle="modal" data-target="#codepad-modal" style="color: teal"></a>';
        if (x.status === 'B_ATTEMPTED') return '<a class="fa fa-refresh fa-lg view-code-btn" data-toggle="modal" data-target="#codepad-modal" style="color: orange"></a>';
        return '<i class="fa fa-times fa-lg" style="color: red"></i>';
    }
});

Template.exerciseStatsTable.events({
    'click .view-code-btn': function () {
        Session.set('selectedAttempt', this.attemptId);
    }
});