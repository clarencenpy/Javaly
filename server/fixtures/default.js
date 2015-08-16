if(Meteor.users.find().count() === 0) {
    //creating users
    var users = [
        {password: "J@va1y!", name:"Admin", email:"admin@smu.edu.sg", roles:['admin']},

        {password: "yllee", name:"Lee Yeow Leong", email:"yllee@smu.edu.sg", roles:['instructor']},
        {password: "cboesch", name:"Chris Boesch", email:"cboesch@smu.edu.sg", roles:['instructor']},
        {password: "kevinsteppe", name:"Kevin Steppe", email:"kevinsteppe@smu.edu.sg", roles:['instructor']},

        {password: "wtwong.2015", name:"Wong Wai Tuck", email:"wtwong.2015@sis.smu.edu.sg", roles:['ta']},
        {password: "ernestche.2014", name:"Ernest Che", email:"ernestche.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "jytay.2014", name:"Tay Jing Ying", email:"jytay.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "kester.yeo.2014", name:"Kester Yeo", email:"kester.yeo.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "keefetan.2014", name:"Keefe Tan", email:"keefetan.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "russell.yap.2014", name:"Russell Yap", email:"russell.yap.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "remy.ng.2014", name:"Remy Ng", email:"remy.ng.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "jeremyong.2014", name:"Jeremy Ong", email:"jeremyong.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "kailong.sim.2014", name:"Sim Kai Long", email:"kailong.sim.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "minyan.beh.2014", name:"Beh Min Yan", email:"minyan.beh.2014@sis.smu.edu.sg", roles:['ta']},
        {password: "password", name:"Clarence Ngoh", email:"py.ngoh.2014@sis.smu.edu.sg", roles:['ta']},

        {password: "password", name:"Student1", email:"s1@smu.com", roles:['student']},
        {password: "password", name:"Student2", email:"s2@smu.com", roles:['student']},
        {password: "password", name:"Student3", email:"s3@smu.com", roles:['student']}
    ];

    _.each(users, function (user) {
        var id;

        id = Accounts.createUser({
            email: user.email,
            password: user.password,
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
            content: 'Write a method <span style="font-weight: bold">add(int a, int b)</span> that returns the sum of both integers.',
            methodName: 'add',
            questionType: 'RETURN',
            methodType: 'NON_STATIC',
            testCases: [
                {
                    description: "add(1,2)",
                    prepCode: "",
                    input: "1,2",
                    output: "3",
                    visibility: "SHOW"
                },
                {
                    description: "add(2,-2)",
                    prepCode: "",
                    input: "2,-2",
                    output: "0",
                    visibility: "SHOW"
                },
                {
                    description: "add(10,2)",
                    prepCode: "",
                    input: "10,2",
                    output: "12",
                    visibility: "SHOW"
                }
            ]
        },
        {
            title: 'Power Power',
            content: 'Write a method <span style="font-weight: bold">power(int base, int exponent)</span> that returns base<span style="vertical-align: super;">exponent</span>. You may assume that exponent is a positive integer.',
            methodName: 'power',
            questionType: 'RETURN',
            methodType: 'NON_STATIC',
            testCases: [
                {
                    description: "power(2,2)",
                    prepCode: "",
                    input: "2,2",
                    output: "4",
                    visibility: "SHOW"
                },
                {
                    description: "power(3,3)",
                    prepCode: "",
                    input: "3,3",
                    output: "27",
                    visibility: "SHOW"
                }
            ]
        },
        {
            title: 'Sum the integers in an Array',
            content: 'Write a method <span style="font-weight: bold">add(int[] arr)</span> that prints the sum of all the integers in the array.',
            methodName: 'add',
            questionType: 'SYSTEM_OUT',
            methodType: 'NON_STATIC',
            testCases: [
                {
                    description: "{1,2,3,4}",
                    prepCode: "int[] arr = {1,2,3,4};",
                    input: "arr",
                    output: "\"10\"",
                    visibility: "SHOW"
                },
                {
                    description: "{2,0,2,0}",
                    prepCode: "int[] arr = {2,0,2,0};",
                    input: "arr",
                    output: "\"4\"",
                    visibility: "SHOW"
                }
            ]
        },
        {
            title: 'Print Numbers',
            content: '<p>Write a static method called <code>printNumbers</code> that accepts a maximum number as a parameter and prints each number from 1 up to that maximum, inclusive, boxed by square brackets. For example, consider the following calls: </p> <pre>printNumbers(10);<br>printNumbers(5);</pre> <p>These calls should produce the following output:</p> <pre>[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]<br>[1] [2] [3] [4] [5]</pre> <p>You may assume that the value passed to printNumbers is 1 or greater.</p><p>Credits: PracticeIT</p>',
            methodName: 'printNumbers',
            questionType: 'SYSTEM_OUT',
            methodType: 'STATIC',
            testCases: [
                {
                    description: "printNumbers(10)",
                    prepCode: "",
                    input: "10",
                    output: "\"[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]\"",
                    visibility: "SHOW"
                },
                {
                    description: "printNumbers(5)",
                    prepCode: "",
                    input: "5",
                    output: "\"[1] [2] [3] [4] [5]\"",
                    visibility: "SHOW"
                }
            ]
        },
        {
            title: 'Reading from a scanner',
            content: 'Write a method <span style="font-weight: bold">join(Scanner sc)</span> that prints all the contents in the scanner (by calling next())',
            classname: 'ScannerReader',
            methodName: 'join',
            questionType: 'SYSTEM_OUT',
            methodType: 'NON_STATIC',
            testCases: [
                {
                    description: "i love java",
                    prepCode: "Scanner sc = new Scanner(\"i love java\");",
                    input: "sc",
                    output: "\"i love java\"",
                    visibility: "SHOW"
                },
                {
                    description: "java rocks",
                    prepCode: "Scanner sc = new Scanner(\"java rocks\");",
                    input: "sc",
                    output: "\"java rocks\"",
                    visibility: "SHOW"
                }
            ]
        },
    ];

    var userId = Meteor.users.findOne({'profile.name':'Clarence Ngoh'})._id;

    _.each(questions, function (question) {
        Questions.insert({
            title: question.title,
            content: question.content,
            classname: question.classname,
            methodName: question.methodName,
            questionType: question.questionType,
            methodType: question.methodType,
            testCode: question.testCode,
            testCases: question.testCases,
            createdBy: userId
        })
    })
}

if (Groups.find().count() === 0) {
    var instructor = Meteor.users.findOne({'profile.name':'Lee Yeow Leong'})._id;
    var s1 = Meteor.users.findOne({'profile.name':'Student1'})._id;
    var s2 = Meteor.users.findOne({'profile.name':'Student2'})._id;
    var s3 = Meteor.users.findOne({'profile.name':'Student3'})._id;
    var ta1 = Meteor.users.findOne({'profile.name':'Ernest Che'})._id;
    var ta2 = Meteor.users.findOne({'profile.name':'Tay Jing Ying'})._id;
    var ta3 = Meteor.users.findOne({'profile.name':'Kester Yeo'})._id;
    var ta4 = Meteor.users.findOne({'profile.name':'Keefe Tan'})._id;
    var ta5 = Meteor.users.findOne({'profile.name':'Russell Yap'})._id;
    var ta6 = Meteor.users.findOne({'profile.name':'Remy Ng'})._id;
    var ta7 = Meteor.users.findOne({'profile.name':'Jeremy Ong'})._id;
    var ta8 = Meteor.users.findOne({'profile.name':'Sim Kai Long'})._id;
    var ta9 = Meteor.users.findOne({'profile.name':'Beh Min Yan'})._id;
    var ta10 = Meteor.users.findOne({'profile.name':'Clarence Ngoh'})._id;
    var ta11 = Meteor.users.findOne({'profile.name':'Wong Wai Tuck'})._id;

    var q1 = Questions.findOne({title: 'Lets add some numbers!'})._id;
    var q2 = Questions.findOne({title: 'Sum the integers in an Array'})._id;
    var q3 = Questions.findOne({title: 'Print Numbers'})._id;
    var q4 = Questions.findOne({title: 'Power Power'})._id;
    var q5 = Questions.findOne({title: 'Reading from a scanner'})._id;

    Groups.insert({
        name: 'Beta Testers',
        groupType: 'PRIVATE',
        participants: [s1,s2,s3,ta1,ta2,ta3,ta4,ta5,ta6,ta7,ta8,ta9,ta10,ta11],
        exercises: [{
            description: 'Test each other\'s questions!',
            questions: [q1,q2,q3,q4,q5]
        }],
        createdBy: instructor
    })
}