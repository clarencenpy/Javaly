Template.resultDisplay.helpers({
    quoteIfString: function (s) {
        if (typeof s === 'string') {
            return '"' + s + '"';
        } else {
            return s;
        }
    },
    pass: function () {
        var results = Template.instance().data;
        var output = '';
        output += _.filter(results.runs, function (run) {
            return run.result.success;
        }).length;
        output += '/';
        output += results.runs.length;
        return output;
    }
});

