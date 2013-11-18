removeShard = function(st, replTest) {
    jsTest.log( "Removing shard with name: " + replTest.name );
    res = st.admin.runCommand( { removeshard: replTest.name } )
    printjson(res);
    assert( res.ok , "failed to start draining shard" );

    checkRemoveShard = function() {
        res = st.admin.runCommand( { removeshard: replTest.name } );
        printjson(res);
        return res.ok && res.msg == 'removeshard completed successfully';
    }
    assert.soon( checkRemoveShard , "failed to remove shard", 90*1000, 5*1000 );
    jsTest.log( "Shard removed successfully" );
};

var st = new ShardingTest( testName = "remove2", numShards = 2, verboseLevel = 0, numMongos = 1,
                           { //chunkSize : 300,
                             rs : true,
                             rs0 : { nodes : 2 },
                             rs1 : { nodes : 2 }
                           });

var rst1 = st._rs[1].test;
var conn = new Mongo( st.s.host );
var coll = conn.getCollection( "test.remove2" );

st.admin.runCommand({ enableSharding : coll.getDB().getName() });
var mongos = st.s0;
var shards = mongos.getDB( "config" ).shards.find().toArray();
printjson( st.admin.runCommand({ movePrimary : coll.getDB() + "", to : shards[1]._id }) );
st.admin.runCommand({ shardCollection : coll.getFullName(), key: { i : 1 }});

var bigstring = "a";

// make a big array with 10000 records
docs = new Array();
for( var i = 0; i < 10000; i++ ){
    docs[i] = { i : 0, str : bigstring} 
}

for( var i = 0; i < 26; i++ ){
    coll.insert(docs);
}

coll.getDB().getLastError();
st.admin.printShardingStatus();
printjson( st.admin.runCommand({ movePrimary : coll.getDB() + "", to : shards[0]._id }) );

removeShard( st, rst1 );
