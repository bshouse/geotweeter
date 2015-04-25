var pkg = require('../package.json'); //Application Settings
var fs = require('fs');
var db;
var collection; //Twitter Collection
var summaryLength = 2;
var summary = {}; //Tweets by country, total tweets, total smiley face matches
summary.name="World Text";
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
	collection.distinct("properties.country", function(err, docs) {
		if (err) {
			console.error("Error - distinct countries: " + err.message);
		} else {
			countries = docs;
			summaryLength += (countries.length * 2);
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

	//Regular expression matching for the following smiley faces:
    //:) :D ;) :-) :P =) ;-) =D =] :] =P :-D ^_^ (: (8 (;
	collection.count({
		"properties.country": country,
		$or:[
			{"properties.text":{$regex:/\:\)/}},
			{"properties.text":{$regex:/\:D/}},	
			{"properties.text":{$regex:/\;\)/}},
			{"properties.text":{$regex:/\:\-\)/}},
			{"properties.text":{$regex:/\:p/}},
			{"properties.text":{$regex:/\=\)/}},
			{"properties.text":{$regex:/\=D/}},
			{"properties.text":{$regex:/\=\]/}},
			{"properties.text":{$regex:/\:\]/}},
			{"properties.text":{$regex:/\:\-D/}},
			{"properties.text":{$regex:/\^\_\^/}},
			{"properties.text":{$regex:/\(\:/}},
			{"properties.text":{$regex:/\(8/}},
			{"properties.text":{$regex:/\(\;/}},	
			{'properties.text':/😄|😃|😀|😊|☺|😉|😍|😘|😚|😗|😙|😜|😝|😛|😁|😇|😏|👮|👷|👶|👦|👧|👨|👩|👴|👵|👱|👼|👸|😺|😸|👹|👽|💩/}
		]
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary[" + country + "].textMatch: " + err.message);
		} else {
			summary[country].textMatch = count;
		}
		wrapIt();
	});
};

var countryCode = function() {
	console.log("Starting countryCode");
	var min = 100;
	var max = 0;
	for (var x = 0; x < countries.length; x++) {
		summary[countries[x]].percent = summary[countries[x]].textMatch / summary[countries[x]].total;
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
	wrapIt();
};

var wrapIt = function() {
	summaryLength -= 1;
	if (summaryLength == 1) {
		//DB queries done
		countryCode();
	} else if (summaryLength == 0) {
		console.log('Saving World Text Summary');
		db.collection('summary').update({"name": "World Text"}, summary, {upsert: true, w:1, safe:true},function(err) { if(err) { console.error(err.message); } db.close(); });
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
