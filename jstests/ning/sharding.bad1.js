var st = new ShardingTest(testName = "ddddd", numShards = 2, verboseLevel = 6, numMongos = 1,  { rs: true, numReplicas: 3, chunksize : 1 });

var mongos = st.s0;
var shards = mongos.getDB( "config" ).shards.find().toArray();

var admin = mongos.getDB( "admin" );
var collSharded = mongos.getCollection( "testDb.testColl" );

assert( admin.runCommand({ enableSharding : collSharded.getDB() + "" }).ok );
printjson( admin.runCommand({ movePrimary : collSharded.getDB() + "", to : shards[0]._id }) );
assert( admin.runCommand({ shardCollection : collSharded + "", key : { skey : 1 } }).ok );

// Turn balancer off 
mongos.getDB( "config" ).settings.update({ _id : "balancer" }, { $set : { stopped : true } }, true )


jsTest.log(st._connections[0].name + "/admin");

//what a fuck
//run('/../../.jumbo/bin/python', '/home/yanglin/mongodb/mongo/t.py')

function testit(){
    jsTest.log( "test dropdb" );

    jsTest.log("before rs.add");
    jsTest.log(tojson(mongos.getDB( "config" ).shards.find().toArray() )) ;

    var rs0 = st.rs0;

    slaveId = rs0.getNodeId( rs0.liveNodes.slaves[0] ); 
    jsTest.log("before rs0.remove() slaveId: " + slaveId);
    //rs0.remove( slaveId );

    master = rs0.getMaster()
    cfg = master.getDB("local")['system.replset'].findOne();
    var config  = rs0.getReplSetConfig(); 
    jsTest.log('log config');
    jsTest.log(tojson(config));
    
    config.version = cfg.version + 1;
    config.members = [ { "_id" : 0, "host" : rs0.host + ":31100" },
                       { "_id" : 2, "host" : rs0.host + ":31102" } ]

    try {
        rs0.initiate( config , 'replSetReconfig' );
    }
    catch(e) {
        jsTest.log(e);
    }

    sleep(15*1000);
    jsTest.log("after rs0.remove() slaveId: " + slaveId);

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

