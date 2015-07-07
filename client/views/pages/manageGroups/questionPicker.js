Template.questionPicker.onCreated(function () {
   this.subscribe('questions');
});

Template.questionPicker.onRendered(function () {
    this.$('.chosen-select').chosen({
        max_selected_options: 5
    });

    var pickedSortable = Sortable.create(this.find('#picked'), {
        group: 'questions',
        dataIdAttr: 'data-id',
        store: {
            get: function (sortable) {
                var order = Session.get('selectedQuestions');
                return order ? order.split('|') : [];
            },
            set: function (sortable) {
                var order = sortable.toArray();
                Session.set('selectedQuestions', order.join('|'));
            }
        }
    });

    Sortable.create(this.find('#unpicked'), {
        group: 'questions',
        dataIdAttr: 'data-id',
        onEnd: function () {
            var order = pickedSortable.toArray();
            Session.set('selectedQuestions', order.join('|'));
        }
    });

    //instantiate slimScroll for every element with droparea class
    //this.$('.droparea').each(function () {
    //    $(this).slimScroll({
    //        height: '300px',
    //        color: 'grey',
    //        size: '5px',
    //    });
    //});

});

Template.questionPicker.helpers({
   questions: function () {
       return Questions.find();
   }
});

Template.questionPicker.onDestroyed(function () {
    Session.set('selectedQuestions', null);
});