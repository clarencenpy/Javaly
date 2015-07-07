Template.questionBank.onCreated(function () {
    this.subscribe('questions');
    this.subscribe('attempts');
});

Template.questionBank.helpers({
    questions: function () {
       return Questions.find();
    }
});