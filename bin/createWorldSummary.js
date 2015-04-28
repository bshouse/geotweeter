var pkg = require('../package.json'); //Application Settings
var fs = require('fs');
var db;
var collection; //Twitter Collection
var summaryLength = 6; //+1 by pg
var summary = {}; //Tweets by country, total tweets, place/point geotag
summary.name="World";
summary.total = 0;
summary.places = 0;
summary.points = 0;
summary.media = 0; //added by pg
var countries;

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
	collection.count({}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.total: " + err.message);
		} else {
			summary.total = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.point": false
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.places: " + err.message);
		} else {
			summary.places = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.point": true
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.points: " + err.message);
		} else {
			summary.points = count;
		}
		wrapIt();
	});

//added by pg
	collection.count({
		"properties.media": {$ne: "Image Not Found"} // change here
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media: " + err.message);
		} else {
			summary.media = count;
		}
		wrapIt();
	});
//added by pg

	collection.distinct("properties.country", function(err, docs) {
		if (err) {
			console.error("Error - distinct countries: " + err.message);
		} else {
			countries = docs;
			summaryLength += (countries.length * 4); //+1 by pg
			for (var x = 0; x < countries.length; x++) {
				countries[x] = countries[x].replace(/\./g,'_');
				countrySum(countries[x]);
			}
		}
		wrapIt();
	});
};

var countrySum = function(country) {

	summary[country] = {};
	collection.count({
		"properties.country": country
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary[" + country + "].total: " + err.message);
		} else {
			summary[country].total = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.point": false,
		"properties.country": country
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary[" + country + "].places: " + err.message);
		} else {
			summary[country].places = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.point": true,
		"properties.country": country
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary[" + country + "].points: " + err.message);
		} else {
			summary[country].points = count;
		}
		wrapIt();
	});
//added by pg
	collection.count({
		"properties.media": {$ne: "Image Not Found"},
		"properties.country": country
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary[" + country + "].media: " + err.message);
		} else {
			summary[country].media = count;
		}
		wrapIt();
	});
//added by pg
};

var countryCode = function() {
	console.log("Starting countryCode");
	var min = 100;
	var max = 0;
	for (var x = 0; x < countries.length; x++) {
		summary[countries[x]].percent = summary[countries[x]].total / summary.total;
		if (summary[countries[x]].percent < min) {
			min = summary[countries[x]].percent;
		}
		if (summary[countries[x]].percent > max) {
			max = summary[countries[x]].percent;
		}
	}
	console.log("Creating HeatMap");
	for (var x = 0; x < countries.length; x++) {
		if (summary[countries[x]].total) {
			summary[countries[x]].heat = rgb(min, max, summary[countries[x]].percent);
		}
	};
};

var mediaCode = function() {
	console.log("Starting mediaCode");
	var min = 100;
	var max = 0;
	for (var x = 0; x < countries.length; x++) {
		summary[countries[x]].mediaPercent = summary[countries[x]].media / summary.media;
		if (summary[countries[x]].mediaPercent < min) {
			min = summary[countries[x]].mediaPercent;
		}
		if (summary[countries[x]].mediaPercent > max) {
			max = summary[countries[x]].mediaPercent;
		}
	}
	console.log("Creating Media HeatMap");
	for (var x = 0; x < countries.length; x++) {
		if (summary[countries[x]].media) {
			summary[countries[x]].mediaHeat = rgb(min, max, summary[countries[x]].mediaPercent);
		}
	};
	wrapIt();
};


var wrapIt = function() {
	summaryLength -= 1;
	if (summaryLength == 1) {
		//DB queries done
		countryCode();
		mediaCode();
	} else if (summaryLength == 0) {
		console.log('Saving World Summary');
		db.collection('summary').update({"name": "World"}, summary, {upsert: true, w:1, safe:true},function(err) { if(err) { console.error(err.message); } db.close(); });
	}
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
