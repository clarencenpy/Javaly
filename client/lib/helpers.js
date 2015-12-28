Template.registerHelper('humanizeSeconds', function (timeInSeconds) {
    var duration = moment().startOf('day').add(timeInSeconds, 's'),
        format = "";

    if(duration.hour() > 0){ format += "H [h] "; }

    if(duration.minute() > 0){ format += "m [m] "; }

    format += " s [s]";

    return duration.format(format);
});

toggleSidebar = function() {
    $("body").toggleClass("mini-navbar");

    // Enable smoothly hide/show menu
    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
        // Hide menu in order to smoothly turn on when maximize menu
        $('#side-menu').hide();
        // For smoothly turn on menu
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 100);
    } else if ($('body').hasClass('fixed-sidebar')) {
        $('#side-menu').hide();
        setTimeout(
            function () {
                $('#side-menu').fadeIn(500);
            }, 300);
    } else {
        // Remove all inline style from jquery fadeIn function to reset menu state
        $('#side-menu').removeAttr('style');
    }
}