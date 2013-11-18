var st = new ShardingTest(testName = "dropdb", numShards = 2, verboseLevel = 6, numMongos = 1,  { rs: true, numReplicas: 2, chunksize : 1 });

var mongos = st.s0;
var shards = mongos.getDB( "config" ).shards.find().toArray();

var admin = mongos.getDB( "admin" );
var collSharded = mongos.getCollection( "testdb.collSharded" );
var collUnSharded = mongos.getCollection( "testdb.collUnSharded" );

assert( admin.runCommand({ enableSharding : collSharded.getDB() + "" }).ok );
printjson( admin.runCommand({ movePrimary : collSharded.getDB() + "", to : shards[0]._id }) );
assert( admin.runCommand({ shardCollection : collSharded + "", key : { skey : 1 } }).ok );
assert( admin.runCommand({ split : collSharded + "", middle : { skey : 0 } }).ok );
assert( admin.runCommand({ moveChunk : collSharded + "", find : { skey : 0 }, to : shards[1]._id }).ok );

function testSelectWithSkip(coll){
    jsTest.log( "test dropdb" );

    for (var sk = -5; sk < 5; sk++) {
        for (var id = 0; id < 100; id++) {
            coll.insert({ id : id, skey : sk});
        }
    }

    jsTest.log( "will dropdb" );
    mongos.getDB("testdb").dropDatabase();
}

testSelectWithSkip(collSharded)
//printjson( admin.runCommand({'shardConnPoolStats':1}) );
//testSelectWithSkip(collUnSharded)

