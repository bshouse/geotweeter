//Threshold Values
var BIG_STATES = 4;
var BIG_COUNTRIES = 3;

var pkg = require('../package.json'); //Application Settings
var db;
var collection; //Twitter Collection
var summaryLength = 3;
var screenNamePos = 0;
var summaryPos = 0;
var summary = {}; //Tweets by screen name summary
summary.name = "Travel";
summary.time = new Date(); //Track when the report was created
summary.users={};
summary.stateCount = 0;
summary.smallStates = [];
summary.countryCount = 0;
summary.smallCountries = [];


var createSummary = function() {

	for (var x = 0; x < BIG_STATES+100; x++) {
		summary.smallStates[x] = {};
		if(x < BIG_STATES) {
			summary.smallStates[x].name = x+' states/provinces';
		} else if(x == BIG_STATES) {
			summary.smallStates[x].name = BIG_STATES+' - '+(BIG_STATES+9)+' states/provinces';
		} else {
			var start = ((x-BIG_STATES)*10)+BIG_STATES;
			summary.smallStates[x].name = start+' - '+(start+9)+' states/provinces';
		}
		summary.smallStates[x].value=0;
	}
	for (var x = 0; x < BIG_COUNTRIES+100; x++) {
		summary.smallCountries[x] = {};
		if(x < BIG_COUNTRIES) {
			summary.smallCountries[x].name = x+' countries';
		} else if(x == BIG_COUNTRIES) {
			summary.smallCountries[x].name = BIG_COUNTRIES+' - '+(BIG_COUNTRIES+9)+' countries';
		} else {
			var start = ((x-BIG_COUNTRIES)*10)+BIG_COUNTRIES;
			summary.smallCountries[x].name = start+' - '+(start+9)+' countries';
		}
		summary.smallCountries[x].value=0;
	}


	db.command({
			'aggregate': 'twitter',
			'pipeline': [{
				$group: {
					_id: "$properties.country"
				}
			}, {
				$group: {
					_id: 1,
					count: {
						$sum: 1
					}
				}
			}]
		},
		function(err, docs) {
			if (err) {
				console.error("Error - distinct countries: " + err.message);
			} else {
				summary.countryCount = docs.result[0].count;
				console.log('Distinct Countries: ' + summary.countryCount);
			}
			wrapIt();
		}
	);
	db.command({
			'aggregate': 'twitter',
			'pipeline': [{
				$group: {
					_id: "$properties.state"
				}
			}, {
				$group: {
					_id: 1,
					count: {
						$sum: 1
					}
				}
			}]
		},
		function(err, docs) {
			if (err) {
				console.error("Error - distinct states/provinces: " + err.message);
			} else {
				summary.stateCount = docs.result[0].count;
				console.log('Distinct States: ' + summary.stateCount);
			}
			wrapIt();
		}
	);

	collection.find({}, function(err, resultCursor) {
		if (err) {
			console.error('Find Error: ' + err);
		}
		collectUsers(resultCursor);
	});

};

var collectUsers = function(resultCursor) {
	console.log('Collecting user locations. Please wait....This could take a long time.')
	var count = 0;
	resultCursor.each(function(err, result) {
		if (err) {
			console.error(err);
		}
		if (result == null) {
			simplifyUsers();
			return;
		}

		//Ensure user_id has a object
		if (!summary.users[result.properties.user_id]) {
			summary.users[result.properties.user_id] = {};
		}

		//Ensure the user_id has a country object
		if (!summary.users[result.properties.user_id][result.properties.country]) {
			summary.users[result.properties.user_id][result.properties.country] = {};
		}

		//Ensure the user_id country object has this state
		if (!summary.users[result.properties.user_id][result.properties.country].state) {
			summary.users[result.properties.user_id][result.properties.country].state=[];
		}
		if(summary.users[result.properties.user_id][result.properties.country].state.indexOf(result.properties.state) < 0) {
			summary.users[result.properties.user_id][result.properties.country].state.push(result.properties.state);
		}


	});

};

var simplifyUsers = function() {
	console.log('Total user IDs: ' + Object.keys(summary.users).length);
	console.log('Distilling country and state/province counts');
	for (key in summary.users) {

		//Country Count

		var loc= Object.keys(summary.users[key]).length;
		if(loc < BIG_COUNTRIES) {
			//In the little counts
			summary.smallCountries[loc].value++;
		} else {
			//Groups of 10
			summary.smallCountries[Math.floor(BIG_COUNTRIES+(loc/10))].value++;
		}

		//State/province count
		var states=0;
		for(k in summary.users[key]) {
			states += summary.users[key][k].state.length;
		}
		if(states < BIG_STATES) {
			//In the little counts
			summary.smallStates[states].value++;
		} else {
			//Groups of 10
			summary.smallStates[Math.floor(BIG_STATES+(loc/10))].value++;
		}

		//Free up the memory
		delete summary.users[key];


	}

	console.log('Removing ranges with zero users');
	//Remove zero counts
	var ss = [];
	for(var x = 0; x < summary.smallStates.length; x++) {
		if(summary.smallStates[x].value != 0) {
			ss.push(summary.smallStates[x]);
		}
	}
	summary.smallStates = ss;

	var sc = [];
	for(var x = 0; x < summary.smallCountries.length; x++) {
		if(summary.smallCountries[x].value != 0) {
			sc.push(summary.smallCountries[x]);
		}
	}
	summary.smallCountries = sc;

	wrapIt();

};



var wrapIt = function() {
	summaryPos++;
	console.log(summaryPos + "/" + summaryLength);
	if (summaryLength == summaryPos) {
		console.log("Writing Summary");
		//console.log(summary);
		db.collection('summary').update({
			"name": summary.name
		}, summary, {
			upsert: true,
			w: 1,
			safe: true
		}, function(err) {
			if (err) {
				console.error('Update Error: ' + err.message);
			} else {
				console.log('Done');
			}
			db.close();
		});
	}
}

var dbLoaded = function(err, database) {
	if (err) {
		console.error(err.message);
	}
	db = database;
	collection = db.collection('twitter');
	console.log("Database Connected");
	createSummary();
};
require('mongodb').MongoClient.connect(pkg.config.db_url, dbLoaded);
