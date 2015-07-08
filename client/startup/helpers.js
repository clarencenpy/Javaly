Template.registerHelper('humanizeSeconds', function (timeInSeconds) {
    var duration = moment().startOf('day').add(timeInSeconds, 's'),
        format = "";

    if(duration.hour() > 0){ format += "H [h] "; }

    if(duration.minute() > 0){ format += "m [m] "; }

    format += " s [s]";

    return duration.format(format);
});