Template.codepad.helpers({
    compileResult: function () {
        return Session.get('compileResult');
    },

    compileError: function () {
        return Session.get('compileError');
    },
    compileResultOrError: function () {
        return Session.get('compileResult') || Session.get('compileError');
    }
});
