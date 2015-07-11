if(Meteor.users.find().count() === 0) {
    //creating users
    var users = [
        {name:"Yeow Leong", email:"yl@smu.com", roles:['instructor']},
        {name:"Student1", email:"s1@smu.com", roles:['student']},
        {name:"Student2", email:"s2@smu.com", roles:['student']},
        {name:"Student3", email:"s3@smu.com", roles:['student']},
        {name:"Student4", email:"s4@smu.com", roles:['student']}
    ];

    _.each(users, function (user) {
        var id;

        id = Accounts.createUser({
            email: user.email,
            password: "password",
            profile: { name: user.name }
        });

        if (user.roles.length > 0) {
            // Need _id of existing user record so this call must come
            // after `Accounts.createUser` or `Accounts.onCreate`
            Roles.addUsersToRoles(id, user.roles);
        }

    });

}

if (Questions.find().count() === 0) {
    var questions = [
        {
            title: 'Lets add some numbers!',
            content: 'Write an Adder class that has a static method <span style="font-weight: bold">add(int a, int b)</span> that returns the sum of both integers.',
            classname: 'Adder',
            testCode: 'import java.io.*;public class Test extends TestUtil {public static ResultSet run(ByteArrayOutputStream outContent) {Tester t = new Tester();try{t.assertEquals("add(1,2)", 3, Adder.add(1,2));} catch (Exception e) {t.addResult("add(1,2)", 3, captureStacktrace(e), false);}try {t.assertEquals("add(-1,1)", 0, Adder.add(-1,1));} catch (Exception e) {t.addResult("add(-1,1)", 0, captureStacktrace(e), false);}return t.getResultSet();}}',
            uploaded: true,
            checked: true
        },
        {
            title: 'Sum the integers in an Array',
            content: 'Write an Adder class that has a static method <span style="font-weight: bold">add(int[] arr)</span> that prints out the sum of all the integers in the array.',
            classname: 'Adder',
            testCode: 'import java.io.*;public class Test extends TestUtil {public static ResultSet run(ByteArrayOutputStream outContent) {Tester t = new Tester();int[] arr = {1,2,3,4};int expectedOutput = 10;try {Adder.add(arr);t.assertEquals("arr: {1,2,3,4}", expectedOutput, Integer.parseInt(captureSystemOutput(outContent)));} catch (Exception e) {t.addResult("arr: {1,2,3,4}", expectedOutput, captureStacktrace(e), false);}arr = new int[] {3,3,3,3};expectedOutput = 12;try {Adder.add(arr);t.assertEquals("arr: {3,3,3,3}", expectedOutput, Integer.parseInt(captureSystemOutput(outContent)));} catch (Exception e) {t.addResult("arr: {3,3,3,3}", expectedOutput, captureStacktrace(e), false);}return t.getResultSet();}}',
            uploaded: true,
            checked: true
        },
        {
            title: 'Print Numbers',
            content: '<p>Class: Printer<br>Write a static method called <code>printNumbers</code> that accepts a maximum number as a parameter and prints each number from 1 up to that maximum, inclusive, boxed by square brackets. For example, consider the following calls: </p> <pre>printNumbers(10);<br>printNumbers(5);</pre> <p>These calls should produce the following output:</p> <pre>[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]<br>[1] [2] [3] [4] [5]</pre> <p>You may assume that the value passed to printNumbers is 1 or greater.</p>',
            classname: 'Printer',
            testCode: 'import java.io.*;public class Test extends TestUtil {public static ResultSet run(ByteArrayOutputStream outContent) {Tester t = new Tester();String expectedOutput = "[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]";try {Printer.printNumbers(10);t.assertEquals("printNumbers(10)", expectedOutput, captureSystemOutput(outContent).trim());} catch (Exception e) {t.addResult("printNumbers(10)", expectedOutput, captureStacktrace(e), false);}expectedOutput = "[1] [2] [3] [4] [5]";try {Printer.printNumbers(5);t.assertEquals("printNumbers(5)", expectedOutput, captureSystemOutput(outContent).trim());} catch (Exception e) {t.addResult("printNumbers(5)", expectedOutput, captureStacktrace(e), false);}return t.getResultSet();}}',
            uploaded: true,
            checked: true
        }
    ];

    var userId = Meteor.users.findOne({'profile.name':'Yeow Leong'})._id;

    _.each(questions, function (question) {
        Questions.insert({
            title: question.title,
            content: question.content,
            classname: question.classname,
            testCode: question.testCode,
            uploaded: true,
            checked: true,
            createdBy: userId
        })
    })
}

if (Groups.find().count() === 0) {
    var instructor = Meteor.users.findOne({'profile.name':'Yeow Leong'})._id;
    var s1 = Meteor.users.findOne({'profile.name':'Student1'})._id;
    var s2 = Meteor.users.findOne({'profile.name':'Student2'})._id;
    var s3 = Meteor.users.findOne({'profile.name':'Student3'})._id;
    var q1 = Questions.findOne({title: 'Lets add some numbers!'})._id;
    var q2 = Questions.findOne({title: 'Sum the integers in an Array'})._id;
    var q3 = Questions.findOne({title: 'Print Numbers'})._id;

    Groups.insert({
        name: 'Beta Testers',
        participants: [s1,s2,s3],
        exercises: [{
            description: 'Having fun with each other\'s code',
            questions: [q1,q2,q3]
        }],
        createdBy: instructor
    })
}