Template.exerciseStatsTable.helpers({
    display: function (x) {
        if (typeof x === 'number' || typeof x === 'string') return x;
        if (x.status === 'A_COMPLETED') return '<i class="fa fa-check fa-lg" style="color: teal"></i>';
        if (x.status === 'B_ATTEMPTED') return '<i class="fa fa-refresh fa-lg" style="color: orange"></i>';
        return '<i class="fa fa-times fa-lg" style="color: red"></i>';
    }
});