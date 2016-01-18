Template.landing.onRendered(function () {
    $('body').addClass('landing-page');
    $('#page-wrapper').removeClass('gray-bg');
});

Template.landing.onDestroyed(function() {
    $('body').removeClass('landing-page');
    $('#page-wrapper').addClass('gray-bg');
});