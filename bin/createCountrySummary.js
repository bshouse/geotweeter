var pkg = require('../package.json'); //Application Settings
var fs = require('fs');
var db;
var collection; //Twitter Collection
var countries=null; //Array of countries
var states=null;
var worldSummary=null;
var summaryLength = 4; //+1 by pg
var summaryPos = 0;
var summary = {}; //Tweets by state, total tweets, place/point geotag
var country;
var countryPos = 0;
var state;
var statePos = 0;

//Heat map coloring
//Provide a range minimum and maximum along with the target value
//Returns a CSS ready RGB value
var rgb = function(minimum, maximum, value) {
	var ratio = 2 * (value - minimum) / (maximum - minimum);
	var b = 255 * (1 - ratio);
	if (b < 0) {
		b = 0;
	}
	var r = 255 * (ratio - 1);
	if (r < 0) {
		r = 0;
	}
	var g = 255 - b - r;
	return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
};



var createSummary = function() {
	console.log("Starting createSummary");
	console.log('Loading a list of all known countries');
	collection.distinct("properties.country", function(err, docs) {
		if (err) {
			console.error("Error - distinct countries: " + err.message);
			process.exit();
		} else {
			countries = docs;	
		}
		
	});

	console.log('Loading World Summary');	
	db.collection('summary').find({'name': 'World'},
	 function(err, cursor) {
		if (err) {
			console.error(err.message);
			process.exit();
		} else {
			cursor.toArray(function(err, arr) {
				if(err) {
					console.error(err.message);
					process.exit();
				} else {
					if(arr.length == 0) {
						console.error('Missing World Summary. Try running createWorldSummary.js first');
						process.exit();					
					}
					worldSummary=arr[0];
				} 
			});
			
		}
	});
	
	countrySum();

};

var loadStates = function () {
	console.log('Loading states for '+country);
	collection.distinct('properties.state',{'properties.country': country}, function(err, docs) {
		if (err) {
			console.error("Error - distinct states: " + err.message);
		} else {
			states = docs;
			countrySum();	
		}
	});
};

var countrySum = function() {	
	if(countries == null || worldSummary == null) {
		setTimeout(countrySum,1000);
		return;	
	}
	if(countryPos == countries.length) {
		console.log('Done.');
		db.close();
		process.exit();
	}	
	
	country = countries[countryPos];
	if(states == null) {
		loadStates();
		return;
	}
	
	console.log('Creating a Country summary for: '+country);
	summary={};
	summary.name=country;
	summary.total=worldSummary[country].total;
	summary.places = worldSummary[country].places;
	summary.points = worldSummary[country].points;
	summary.points = worldSummary[country].media //added by pg

	if(states.length != 0) {
		statePos=0;
		stateSum();
	} else {
		console.log(country+' has no states');
		saveCountry();
	}
	
};
var stateSum = function () {
	state = states[statePos];
	console.log("Creating a State summary for: "+state);
	summary[state] = {};
	collection.count({
		'properties.country': country,
		'properties.state': state,
	}, {}, function(err, count) {
		if (err) {
			console.error('Error - summary[' + state + '].total: ' + err.message);
		} else {
			summary[state].total = count;
		}
		wrapState();
	});
	collection.count({
		'properties.point': false,
		'properties.country': country,
		'properties.state': state
	}, {}, function(err, count) {
		if (err) {
			console.error('Error - summary[' + state + '].places: ' + err.message);
		} else {
			summary[state].places = count;
		}
		wrapState();
	});
	collection.count({
		'properties.point': true,
		'properties.country': country,
		'properties.state': state
	}, {}, function(err, count) {
		if (err) {
			console.error('Error - summary[' + state + '].points: ' + err.message);
		} else {
			summary[state].points = count;
		}
		wrapState();
	});
//added by pg
	collection.count({
		"properties.media": {$ne: "Image Not Found"},
		'properties.country': country,
		'properties.state': state
	}, {}, function(err, count) {
		if (err) {
			console.error('Error - summary[' + state + '].media: ' + err.message);
		} else {
			summary[state].media = count;
		}
		wrapState();
	});
//added by pg
};

var wrapState = function() {
	summaryPos++;
	if(summaryPos == summaryLength) {
		summaryPos=0;
		statePos++;
		if(statePos < states.length) {
			stateSum();			
		} else {
			stateCode(); //Heat map & percents
		}
	}
};

var stateCode = function() {
	console.log("Starting stateCode");
	var min = 100;
	var max = 0;
	for (var x = 0; x < states.length; x++) {
		summary[states[x]].percent = summary[states[x]].total / summary.total;
		if (summary[states[x]].percent < min) {
			min = summary[states[x]].percent;
		}
		if (summary[states[x]].percent > max) {
			max = summary[states[x]].percent;
		}
	}
	console.log("Creating HeatMap");
	for (var x = 0; x < states.length; x++) {
		if (summary[states[x]].total) {
			summary[states[x]].heat = rgb(min, max, summary[states[x]].percent);
		}
	};
	saveCountry();
};

var saveCountry = function () {
	db.collection('summary').update({"name": country}, summary, {upsert: true, w:1, safe:true},
		function(err) { 
			if(err) { 
				console.error(err.message); 
			}
			states=null;
			countryPos++;
			countrySum();
	});
};


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
