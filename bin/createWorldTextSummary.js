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
var rgb = function(heats, value) {
	var index = Math.floor(heats.length/6);
	var colors = ['rgb(254,235,226)','rgb(252,197,192)',
				  'rgb(250,159,181)','rgb(247,104,161)',
				  'rgb(197,27,138)' ,'rgb(122,1,119)'];
	if( value < heats[index]){
		return colors[0];
	}else if ( value <= heats[index*2]){
		return colors[1];
	}else if ( value <= heats[index*3]){
		return colors[2];
	}else if ( value <= heats[index*4]){
		return colors[3];
	}else if ( value <= heats[index*5]){
		return colors[4];
	}else{
		return colors[5];
	}
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
    //:) :D :-D ;) :-) :P :p :-P :-p =) ;-) =D =] :] =P :-D ^_^ (^^) (: (8 (;
	collection.count({
		"properties.country": country,
		$or:[
			{"properties.text":{$regex:/\:\)/}},
			{"properties.text":{$regex:/\:D/}},	
			{"properties.text":{$regex:/\:\-D/}},
			{"properties.text":{$regex:/\(\^\^\)/}},	
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
			{"properties.text":{$regex:/\:\-P/}},
			{"properties.text":{$regex:/\:\-p/}},
			{"properties.text":{$regex:/\:p/}},	
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
	var heats = [];
	for (var x = 0; x < countries.length; x++) {
		summary[countries[x]].percent = summary[countries[x]].textMatch / summary[countries[x]].total;
		heats.push(summary[countries[x]].percent);
	}
	heats.sort(function(a,b){return a-b;});
	console.log("Creating HeatMap");
	for (var x = 0; x < countries.length; x++) {
		if (summary[countries[x]].total) {
			summary[countries[x]].heat = rgb(heats, summary[countries[x]].percent);
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
