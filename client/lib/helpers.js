Template.registerHelper('humanizeSeconds', function (timeInSeconds) {
    var duration = moment().startOf('day').add(timeInSeconds, 's'),
        format = "";

    if(duration.hour() > 0){ format += "H [h] "; }

    if(duration.minute() > 0){ format += "m [m] "; }

    format += " s [s]";

    return duration.format(format);
});

Template.registerHelper('moCalendarDetailed', function (time) {
    if (time !== undefined) {
        return moment(time).calendar(null, {
            sameDay: '[Today], h:mm a',
            nextDay: '[Tomorrow], h:mm a',
            nextWeek: 'dddd, h:mm a',
            lastDay: '[Yesterday], h:mm a',
            lastWeek: '[Last] dddd, h:mm a',
            sameElse: 'DD MMM YY, h:mm a'
        });
    }
});

Template.registerHelper('log', function (log) {
    console.log(log)
})


/** CODE TO MANIPULATE THE SIDEBAR **/

//toggleSidebar = function() {
//    $("body").toggleClass("mini-navbar");
//
//    // Enable smoothly hide/show menu
//    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
//        // Hide menu in order to smoothly turn on when maximize menu
//        $('#side-menu').hide();
//        // For smoothly turn on menu
//        setTimeout(
//            function () {
//                $('#side-menu').fadeIn(500);
//            }, 100);
//    } else if ($('body').hasClass('fixed-sidebar')) {
//        $('#side-menu').hide();
//        setTimeout(
//            function () {
//                $('#side-menu').fadeIn(500);
//            }, 300);
//    } else {
//        // Remove all inline style from jquery fadeIn function to reset menu state
//        $('#side-menu').removeAttr('style');
//    }
//};
//
//collapseSidebar = _.throttle(function() {
//    $("body").addClass("mini-navbar");
//
//    // Enable smoothly hide/show menu
//    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
//        // Hide menu in order to smoothly turn on when maximize menu
//        $('#side-menu').hide();
//        // For smoothly turn on menu
//        setTimeout(
//            function () {
//                $('#side-menu').fadeIn(500);
//            }, 100);
//    } else if ($('body').hasClass('fixed-sidebar')) {
//        $('#side-menu').hide();
//        setTimeout(
//            function () {
//                $('#side-menu').fadeIn(500);
//            }, 300);
//    } else {
//        // Remove all inline style from jquery fadeIn function to reset menu state
//        $('#side-menu').removeAttr('style');
//    }
//}, 1000, {trailing: false});
//
//
//expandSidebar = _.throttle(function() {
//    $("body").removeClass("mini-navbar");
//
//    // Enable smoothly hide/show menu
//    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
//        // Hide menu in order to smoothly turn on when maximize menu
//        $('#side-menu').hide();
//        // For smoothly turn on menu
//        setTimeout(
//            function () {
//                $('#side-menu').fadeIn(500);
//            }, 100);
//    } else if ($('body').hasClass('fixed-sidebar')) {
//        $('#side-menu').hide();
//        setTimeout(
//            function () {
//                $('#side-menu').fadeIn(500);
//            }, 300);
//    } else {
//        // Remove all inline style from jquery fadeIn function to reset menu state
//        $('#side-menu').removeAttr('style');
//    }
//}, 1000, {trailing: false});