Template.resultDisplay.helpers({
   quoteIfString: function (s) {
       if (typeof s === 'string') {
           return '"' + s + '"';
       } else {
           return s;
       }
   }
});