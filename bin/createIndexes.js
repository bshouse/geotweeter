var pkg = require('../package.json'); //Application Settings
var indexes=0;
var indexesCompleted=0;
var lastCompleted=-1;
var db;
var twitterIndex = [
	'properties.country',
	'properties.point',
	{"properties.country": 1, "properties.point": 1},
	{"properties.country": 1, "properties.state": 1, "properties.point": 1},
	{"properties.country": 1, "properties.state": 1, "properties.media": 1},
	{"properties.country": 1, "properties.local_doy": 1, "properties.local_hour": 1},
	'properties.local_dow',
	'properties.local_hour',
	'properties.local_doy',
	{"properties.country": 1, "properties.local_dow": 1},
	{"properties.country": 1, "properties.local_hour": 1},
	{"properties.country": 1, "properties.local_doy": 1}
];
var createIndex = function(index,collection) {
	indexes++;
	db.collection(collection).ensureIndex(index, function (error) {
			if(error) {
				console.error(error.message);
			}
			indexesCompleted++;
		});
} 
var closeDb = function() {
	if(indexes == indexesCompleted) {
		console.log(indexesCompleted+'/'+indexes);
		db.close();
	} else {
		if(lastCompleted != indexesCompleted) {
			console.log(indexesCompleted+'/'+indexes);
			lastCompleted=indexesCompleted;		
		}
		setTimeout(closeDb,5000);	
	}	
}
var addIndexes = function () {
	for(var x = 0; x < twitterIndex.length; x++) {
		createIndex(twitterIndex[x],'twitter');	
	}
	closeDb();
}
var dbLoaded = function(err, database) {
	if (err) {
		console.error(err.message);
	}
	db = database;
	console.log('Database Connected');
	addIndexes();
};
require('mongodb').MongoClient.connect(pkg.config.db_url, dbLoaded);
