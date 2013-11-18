// Create {v:0} index on primary. Add new secondary. Make sure same index on secondary is {v:1} - SERVER-3852

var rs = new ReplSetTest( {name: 'rs', nodes: 1, host: 'localhost'} );
rs.startSet();
rs.initiate();
var r2 = rs.add();
rs.reInitiate();
rs.awaitSecondaryNodes();

var r3 = rs.add();
rs.reInitiate();
rs.awaitSecondaryNodes();

