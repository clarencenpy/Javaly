//if (process.env.NODE_ENV !== 'development') {
    process.env.MAIL_URL = 'smtp://smtp.smu.edu.sg';
//}
Meteor.methods({
    sendNudgeEmails: function (mail) {

        /**
         * mail: {
         *     jobs: array of the collated emails to be sent by students, used to generate email content
         *     message: instructor's message
         *     groupName: name of the group
         *     exerciseDesc: desc of the exercise
         *     sender: name of the sender
         * }
         */

        _.each(mail.jobs, function (job) {

            var text = 'Dear ' + job.name + ',<br><br>'
                + 'This is a friendly reminder to revisit an exercise that you have done recently.<br>'
                + '<h3><strong>'+ mail.groupName +'</strong> > '+ mail.exerciseDesc +'</h3>';

            if (job.unsolved.length > 0) {
                text += 'Unsolved Questions:<br>';
                _.each(job.unsolved, function (question) {
                    text += '• ' + question.title + '<br>';
                });
                text += '<br>';
            }

            if (job.retry.length > 0) {
                text += 'Questions to retry:<br>';
                _.each(job.retry, function (question) {
                    text += '• ' + question.title + '<br>';
                });
                text += '<br>';
            }

            text += '<br><br>Yours faithfully,<br>Javaly, on behalf of ' + mail.sender;

            Email.send({
                from: 'javaly@kuala.smu.edu.sg',
                to: job.email,
                subject: 'Review your work: ' + mail.groupName + ' - ' + mail.exerciseDesc,
                html: text
            })
        })
    }
});