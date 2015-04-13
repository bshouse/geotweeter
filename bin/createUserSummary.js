//Threshold Values
var BIG_TWEETS = 500;
var BIG_NAME_CHANGES = 100;

var pkg = require('../package.json'); //Application Settings
var db;
var collection; //Twitter Collection
var screenNames = null; //Array of screen names
var summaryLength = 3;
var screenNamePos = 0;
var summaryPos = 0;
var summary = {}; //Tweets by screen name summary
summary.name = "ScreenName";
summary.screenNameCount = 0; //distinct screen_name count
summary.userIdCount = 0; //distinct user_id count
summary.time = new Date(); //Track when the report was created
summary.users = {}; //USER_ID key'd object of tweet counts
summary.screenName = {}; //USER_ID key'd object of screen names
summary.smallCounts = []; //Array to store counts of users that tweet below the BIG_TWEETS level
summary.totalSmallTweeters = 0; //total count of users contributing to smallCount
summary.smallNames = [];
summary.totalSmallNames= 0;


var createSummary = function() {

	//setup small counts
	for (var x = 0; x < 200; x++) {
		summary.smallCounts[x] = {};
		if(x < 100) {
			summary.smallCounts[x].name = x+' tweets';
		} else if( x > 100){
			var b = ((x-99)*100);
			summary.smallCounts[x].name = b+' - '+(b+99)+' tweets';
		} else {
			summary.smallCounts[x].name = '100 - 199 tweets';
		}
		
		summary.smallCounts[x].count=0;
	}
	for (var x = 0; x < BIG_NAME_CHANGES; x++) {
		summary.smallNames[x] = {};
		summary.smallNames[x].name = x+' changes';
		summary.smallNames[x].count=0;
	}

	db.command({
			'aggregate': 'twitter',
			'pipeline': [{
				$group: {
					_id: "$properties.screen_name"
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
				console.error("Error - distinct screen_names: " + err.message);
			} else {
				summary.screenNameCount = docs.result[0].count;
				console.log('Distinct ScreenNames: ' + summary.screenNameCount);
			}
			wrapIt();
		}
	);
	db.command({
			'aggregate': 'twitter',
			'pipeline': [{
				$group: {
					_id: "$properties.user_id"
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
				console.error("Error - distinct screen_names: " + err.message);
			} else {
				summary.userIdCount = docs.result[0].count;
				console.log('Distinct UserIDs: ' + summary.userIdCount);
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
	var count = 0;
	resultCursor.each(function(err, result) {
		if (err) {
			console.error(err);
		}
		if (result == null) {
			simplifyUsers();
			return;
		}

		//Tweet count
		if (summary.users[result.properties.user_id]) {
			summary.users[result.properties.user_id]++;

		} else {
			summary.users[result.properties.user_id] = 1;
		}


		//Multi-ScreenName Tweeters
		if (summary.screenName[result.properties.user_id]) {
			if(summary.screenName[result.properties.user_id].indexOf(result.properties.screen_name) < 0) {
				summary.screenName[result.properties.user_id][summary.screenName[result.properties.user_id].length] = result.properties.screen_name;
			}
		} else {
			summary.screenName[result.properties.user_id] = [];
			summary.screenName[result.properties.user_id][0] = result.properties.screen_name;
		}

	});

};

var simplifyUsers = function() {
	console.log('Total user IDs: ' + Object.keys(summary.users).length);
	console.log('Distilling tweet counts');
	for (key in summary.users) {
		
		var loc= summary.users[key];
		if(loc < 100) {
			//0 - 99 tweets
			summary.smallCounts[loc].count++;
		} else {
			//Groups of 100
			summary.smallCounts[Math.floor(99+(loc/100))].count++;
		}
		if (loc < BIG_TWEETS) {
			summary.totalSmallTweeters++;
			delete summary.users[key];
		}
	}
	
	console.log('Small Tweeters( < ' + BIG_TWEETS + '): ' + summary.totalSmallTweeters);
	console.log('Big Tweeters( > ' + BIG_TWEETS + '): ' + Object.keys(summary.users).length);

	console.log('Distilling Screen Name Changers');
	for (key in summary.screenName) {
		if (summary.screenName[key].length < BIG_NAME_CHANGES) {
			if(summary.screenName[key].length > 1) {
				summary.totalSmallNames++;
				summary.smallNames[summary.screenName[key].length].count++;
			}
			delete summary.screenName[key];
		}
	}
	console.log('Small Screen Name Changers: ' + summary.totalSmallNames);
	console.log('Big Screen Name Changers: ' + Object.keys(summary.screenName).length);


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
