if (process.env.NODE_ENV !== 'development') {
    process.env.MAIL_URL = 'smtp.smu.edu.sg';
}
Meteor.methods({
    sendNudgeEmails: function (mail) {

        /**
         * mail: {
         *     jobs: array of the collated emails to be sent by students, used to generate email content
         *     message: instructor's message
         *     subject: subject
         *     sender: name of the sender
         * }
         */

        _.each(mail.jobs, function (job) {
            Email.send({
                from: 'javaly@kuala.smu.edu.sg',
                to: job.email,
                subject: mail.subject,
                html: html
            })
        })
    }
});