Template.questionCard.onCreated(function () {
    this.subscribe('question', Template.currentData().toString());
});

Template.questionCard.helpers({
    question: function () {
        return Questions.findOne(this.toString());  //data context this is somehow interpreted as an object
    }
});