
if (Meteor.users.find({'profile.name': 'ahmadsm'}).count() === 0) {
    var instructor = Accounts.createUser({
        email: 'vandanarr@smu.edu.sg',
        password: 'vandanarr',
        profile: { name: 'Vandana' }
    });

    Roles.addUsersToRoles(instructor, ['instructor']);

    var users = [
        {name: 'ahmadsm', email: 'ahmadsm.2015@smu.edu.sg'},
        {name: 'xbchen', email: 'xbchen.2015@smu.edu.sg'},
        {name: 'yuebao.chen', email: 'yuebao.chen.2015@smu.edu.sg'},
        {name: 'lesliecheng', email: 'lesliecheng.2015@smu.edu.sg'},
        {name: 'ervin.chong', email: 'ervin.chong.2015@smu.edu.sg'},
        {name: 'avery.chong', email: 'avery.chong.2015@smu.edu.sg'},
        {name: 'kwchoo', email: 'kwchoo.2015@smu.edu.sg'},
        {name: 'clarissap', email: 'clarissap.2015@sis.smu.edu.sg'},
        {name: 'hailong.gao', email: 'hailong.gao.2015@smu.edu.sg'},
        {name: 'grace.foo', email: 'grace.foo.2015@smu.edu.sg'},
        {name: 'jeryl.soh', email: 'jeryl.soh.2015@smu.edu.sg'},
        {name: 'xinyi.ji', email: 'xinyi.ji.2015@smu.edu.sg'},
        {name: 'yansun.kang', email: 'yansun.kang.2015@smu.edu.sg'},
        {name: 'ql.gwee', email: 'ql.gwee.2015@smu.edu.sg'},
        {name: 'weiqiao.li', email: 'weiqiao.li.2015@smu.edu.sg'},
        {name: 'yingqi.li', email: 'yingqi.li.2015@smu.edu.sg'},
        {name: 'cheryl.lim', email: 'cheryl.lim.2015@smu.edu.sg'},
        {name: 'amanda.lim', email: 'amanda.lim.2015@smu.edu.sg'},
        {name: 'jie.liu', email: 'jie.liu.2015@smu.edu.sg'},
        {name: 'lynnetewong', email: 'lynnetewong.2015@smu.edu.sg'},
        {name: 'chantalleng', email: 'chantalleng.2015@smu.edu.sg'},
        {name: 'shirong.ng', email: 'shirong.ng.2015@smu.edu.sg'},
        {name: 'rsong', email: 'rsong.2015@smu.edu.sg'},
        {name: 'sidrah', email: 'sidrah.2015@smu.edu.sg'},
        {name: 'jeanmin.sin', email: 'jeanmin.sin.2015@smu.edu.sg'},
        {name: 'sunitav', email: 'sunitav.2015@smu.edu.sg'},
        {name: 'cstan', email: 'cstan.2015@smu.edu.sg'},
        {name: 'cwtan', email: 'cwtan.2015@smu.edu.sg'},
        {name: 'tanms', email: 'tanms.2015@smu.edu.sg'},
        {name: 'xuanhao.tan', email: 'xuanhao.tan.2015@smu.edu.sg'},
        {name: 'yenna.tang', email: 'yenna.tang.2015@smu.edu.sg'},
        {name: 'jolene.teo', email: 'jolene.teo.2015@smu.edu.sg'},
        {name: 'iris.thia', email: 'iris.thia.2015@smu.edu.sg'},
        {name: 'victor.tang', email: 'victor.tang.2015@smu.edu.sg'},
        {name: 'qimin.wang', email: 'qimin.wang.2015@smu.edu.sg'},
        {name: 'cecilia.yeo', email: 'cecilia.yeo.2015@smu.edu.sg'},
        {name: 'yfzhang', email: 'yfzhang.2015@smu.edu.sg'},
        {name: 'backup1', email: 'backup1@smu.edu.sg'},
        {name: 'backup2', email: 'backup2.2015@smu.edu.sg'},
        {name: 'backup3', email: 'backup3.2015@smu.edu.sg'},
    ];

    var students = [];

    _.each(users, function (user) {
        var id;

        id = Accounts.createUser({
            email: user.email,
            password: 'is200enrichment',
            profile: { name: user.name }
        });

        students.push(id);

        Roles.addUsersToRoles(id, ['student', 'enrichment-trial']);

    });

    var groupId = Groups.insert({
        name: 'IS200 Enrichment',
        participants: students,
        exercises: [{
            description: 'Javaly - First Class',
            questions: []
        }],
        createdBy: instructor
    });

    console.log('Group ' + groupId + ' created');
}


