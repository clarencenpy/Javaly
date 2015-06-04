Template.questionListing.events({
   'click .start-btn': function () {
       var questionId = this._id;
       var attemptId = Attempts.insert({
           userId: Meteor.userId(),
           questionId: questionId
       });
       Router.go('/codepad/' + attemptId);
       //TODO: should not create new attempt if user has already attempted
   } 
});