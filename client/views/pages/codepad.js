Template.codepad.helpers({
    compileResult: function () {
        return Session.get('compileResult');
    },

    compileError: function () {
        return Session.get('compileError');
    }
});
