Template.questionCard.helpers({
    question: function () {
        return Questions.findOne(this.toString());
    }
});