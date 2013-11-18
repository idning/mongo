var st = new ShardingTest(testName = "ddddd", numShards = 2, verboseLevel = 6, numMongos = 1,  { rs: true, numReplicas: 3, chunksize : 1 });

var mongos = st.s0;

var admin = mongos.getDB( "admin" );

function enableSharding(){

    var collSharded = mongos.getCollection( "testDb.testColl" );
    // Turn balancer off 
    mongos.getDB( "config" ).settings.update({ _id : "balancer" }, { $set : { stopped : true } }, true )

    assert( admin.runCommand({ enableSharding : collSharded.getDB() + "" }).ok );
    var shards = mongos.getDB( "config" ).shards.find().toArray();
    printjson( admin.runCommand({ movePrimary : collSharded.getDB() + "", to : shards[2]._id }) );
    assert( admin.runCommand({ shardCollection : collSharded + "", key : { skey : 1 } }).ok );
}

//what a fuck
//run('/../../.jumbo/bin/python', '/home/yanglin/mongodb/mongo/t.py')

function init1(){
    r = new ReplSetTest({name : "ddddd-rs3", nodes : 4, startPort : 31300});
    r.startSet();

    config = r.getReplSetConfig();
    config.members[2].arbiterOnly = true;

    r.initiate(config);
    r.awaitReplication();

    master = r.getMaster();

    jsTest.log("adding shard ddddd-rs3");

    result = st.adminCommand({"addshard" : "ddddd-rs3/"+config.members[2].host});

    printjson(result);
    assert.eq(result, true);
    return r;
}

function testit(){
    jsTest.log( "test dropdb" );

    var rs0 = init1();
    enableSharding();

    master = rs0.getMaster()
    cfg = master.getDB("local")['system.replset'].findOne();
    var config  = rs0.getReplSetConfig(); 
    jsTest.log('log config');
    jsTest.log(tojson(config));
    
    config.version = cfg.version + 1;
    ms = config.members;
    config.members = [ms[0], ms[1], ms[3]];

    try {
        rs0.initiate( config , 'replSetReconfig' );
    }
    catch(e) {
        jsTest.log(e);
    }

    sleep(15*1000);

    jsTest.log("after rs.add");
    jsTest.log(tojson(mongos.getDB( "config" ).shards.find().toArray() )) ;

    jsTest.log("before drop");
    printjson( admin.runCommand({'shardConnPoolStats':1}) );
    printjson( admin.runCommand({'getShardMap':1}) );

    sleep(15*1000);

    jsTest.log('log status ');
    jsTest.log(tojson(rs0.status()));

    jsTest.log( "will dropdb" );
    sleep(10*1000);
    var conn2 = new Mongo('localhost:30999').getDB('testDb');
    //conn2.testColl.insert({ id : 1024, skey : 0});
    var ret = conn2.dropDatabase();

    jsTest.log("after drop"+tojson(ret));
    printjson( admin.runCommand({'shardConnPoolStats':1}) );
    printjson( admin.runCommand({'getShardMap':1}) );
}

testit()

//printjson( admin.runCommand({'shardConnPoolStats':1}) );
//testSelectWithSkip(collUnSharded)

