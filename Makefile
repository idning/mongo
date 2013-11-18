all:
	scons -j8 all

clean:
	scons -c all

test:
	python buildscripts/smoke.py jstests/sharding/large-skip.js  | tee test-large-skip.log

test-all:
	#scons mongosTest smokeSharding --continue-on-failure
	python buildscripts/smoke.py sharding --continue-on-failure | tee  test-all.log

test-slow:
	python buildscripts/smoke.py jsSlowNightly  jsSlowWeekly replSets --continue-on-failure | tee test-slow.log

case-break:
	python buildscripts/smoke.py /home/yanglin/mongodb/mongo/jstests/sharding/return_partial_shards_down.js

	#ok. /home/yanglin/mongodb/mongo/jstests/sharding/read_pref.js       253
	# /home/yanglin/mongodb/mongo/jstests/sharding/return_partial_shards_down.js      253
	#ok. /home/yanglin/mongodb/mongo/jstests/sharding/read_pref_cmd.js   253
	#ok. /home/yanglin/mongodb/mongo/jstests/sharding/geo_near_random1.js        253



.PHONY: test test-all all

