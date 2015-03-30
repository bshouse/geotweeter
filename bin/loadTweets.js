if (process.argv.length != 3) {
	console.error('Syntax: node ' + process.argv[1] + ' [InputTweetFile.json]');
	console.error('This script takes a list of tweets, converts the location to GeoJSON and sends the output to STDOUT');
	console.error('Errors are sent to STDERR');
	process.exit();
}

console.log("Processing file: "+process.argv[2]);

//Load modules
var reader = require('line-reader'); //Read Tweets file line-by-line
var fs = require('fs');
var turf = require('turf'); //Geographic analysis
var moment = require('moment-timezone'); //Time calculations
var pkg = require('../package.json'); //Application Settings
var db;

//Load GeoJSON
var geo = require('../static/ne_10m_admin_0_countries_lakes.json'); //Country GeoJSON
var state = require('../static/ne_10m_admin_1_states_provinces.json');
var tzone = require('../static/ne_10m_time_zones.json'); //Timezone GeoJSON

//Stats Variable
var lines = 0; //Total lines read
var inserts = 0; //MongoDB insert requests
var insertsComplete = 0; //MongoDB inserts completed
var lastCompleted=-1;
var countryNotFound = 0; //Tweets w/o a country
var stateNotFound = 0; //Tweets w/o a State/Provence
var antarctica = 0; //Tweets from Antarctica
var noTimeZone = 0; //Tweets from Arctic (or other no timezone locations)
var noGeoCode = 0; //No Geo information in tweet
var summary = {}; //Tweets by country, total tweets, place/point geotag
summary.total = 0;
summary.places = 0;
summary.points = 0;

//Constants
var dateFormat = 'ddd MMM DD HH:mm:ss ZZ YYYY'; //Twitter date format

//Country sum
//Keeps count of the total tweets by country
function sum(country, point) {
	summary.total += 1;
	if (!summary[country]) {
		summary[country] = {};
		summary[country].count = 1;
		summary[country].points = 0;
		summary[country].places = 0;
	} else {
		summary[country].count += 1;
	}

	if (point) {
		summary.points += 1;
		summary[country].points += 1;
	} else {
		summary.places += 1;
		summary[country].places += 1;
	}

	return;
};

//Heat map coloring
//Provide a range minimum and maximum along with the target value
//Returns a CSS ready RGB value
function rgb(minimum, maximum, value) {
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
	return 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
};


//Prep the countries with a bounding box.
//The bounding box is used to quickly check if a point is
//anywhere close to the polygon.
for (var i = 0; i < geo.features.length; i++) {
	geo.features[i].bbox = turf.extent(geo.features[i]);
};

//Prep the timezones with a bounding box.
//The bounding box is used to quickly check if a point is
//anywhere close to the polygon.
for (var i = 0; i < tzone.features.length; i++) {
	tzone.features[i].bbox = turf.extent(tzone.features[i]);
};


//Prep the State/Providences with a bounding box.
//The bounding box is used to quickly check if a point is
//anywhere close to the polygon.
for (var i = 0; i < state.features.length; i++) {
	state.features[i].bbox = turf.extent(state.features[i]);
};


/*
 *
 *Convert Twitter locations to GeoJSON
 *
 */
function tweetAsGeoJson(tweet) {
	if (tweet.coordinates) {
		var point = turf.point([tweet.coordinates.coordinates[0], tweet.coordinates.coordinates[1]])
		if (validGeoJsonPoint(point)) {
			point.properties.point = true;
			return point;
		}
	}
	if (tweet.geo) {
		//A simple point (with the coordinates reversed)
		var point = turf.point([tweet.geo.coordinates[1], tweet.geo.coordinates[0]])
		if (validGeoJsonPoint(point)) {
			point.properties.point = true;
			return point;
		}
	}
	if (tweet.place) {
		if (tweet.place.bounding_box) {
			//A bounding box around a location (likely a City)
			//Find the center Point of the bounding box
			var point = turf.center(tweet.place.bounding_box); //Returns a Point
			if (validGeoJsonPoint(point)) {
				point.properties.point = false;
				return point;
			}
		}
	}
	noGeoCode++;
	insert('geo',tweet);
	return false;
};

//Ensure the GeoJSON Point is within limits
function validGeoJsonPoint(point) {
	if (point.geometry.coordinates[0] < -180 || point.geometry.coordinates[0] > 180) {
		return false;
	}
	if (point.geometry.coordinates[1] < -90 || point.geometry.coordinates[1] > 90) {
		return false;
	}
	return true;
}

//Return the country name of GeoJSON point
function findCountry(tweetGeoJson) {
	var near = '';
	//Point inside country boundaries
	for (var i = 0; i < geo.features.length; i++) {
		if (tweetGeoJson.geometry.coordinates[0] >= geo.features[i].bbox[0] &&
			tweetGeoJson.geometry.coordinates[0] <= geo.features[i].bbox[2] &&
			tweetGeoJson.geometry.coordinates[1] >= geo.features[i].bbox[1] &&
			tweetGeoJson.geometry.coordinates[1] <= geo.features[i].bbox[3]) {
			if (turf.inside(tweetGeoJson, geo.features[i])) {
				return geo.features[i].properties.ADMIN;
			} else {
				if (near != '') {
					console.error(lines + ': near match with- ' + near + ' and ' + geo.features[i].properties.ADMIN);
				}
				near = geo.features[i].properties.ADMIN;
			}

			return geo.features[i].properties.ADMIN;
		}
	}

	if (near != '') {
		return near;
	} else {
		return 'Not Found';
	}
}

//Return the state name of GeoJSON point
function findState(country,tweetGeoJson) {
	var near = '';
	//Point inside country boundaries
	for (var i = 0; i < state.features.length; i++) {
		if(state.features[i].properties.admin != country) {
			continue;
		}
		if (tweetGeoJson.geometry.coordinates[0] >= state.features[i].bbox[0] &&
			tweetGeoJson.geometry.coordinates[0] <= state.features[i].bbox[2] &&
			tweetGeoJson.geometry.coordinates[1] >= state.features[i].bbox[1] &&
			tweetGeoJson.geometry.coordinates[1] <= state.features[i].bbox[3]) {
			if (turf.inside(tweetGeoJson, state.features[i])) {
				return state.features[i].properties.name;
			} else {
				if (near != '') {
					console.error(lines + ': near match with- ' + near + ' and ' + state.features[i].properties.name);
				}
				near = state.features[i].properties.name;
			}

			return state.features[i].properties.name;
		}
	}

	if (near != '') {
		return near;
	} else {
		return 'Not Found';
	}
}

//Return the time zone of a GeoJSON point
function findTimeZone(tweetGeoJson) {
	for (var i = 0; i < tzone.features.length; i++) {
		if (tweetGeoJson.geometry.coordinates[0] >= tzone.features[i].bbox[0] &&
			tweetGeoJson.geometry.coordinates[0] <= tzone.features[i].bbox[2] &&
			tweetGeoJson.geometry.coordinates[1] >= tzone.features[i].bbox[1] &&
			tweetGeoJson.geometry.coordinates[1] <= tzone.features[i].bbox[3] &&
			turf.inside(tweetGeoJson, tzone.features[i])) {

			return tzone.features[i].properties.tz_name1st;
		}
	}
	return 'Not Found';
}


function processFile() {
	//Check each tweet
	reader.eachLine(process.argv[2], function(line, last) {
		if (line.substring(line.length - 2) == '}}') { //Dirty Data Check
			var tTweet, geojson;
			lines++; //Line Count
			try {
				tTweet = JSON.parse(line); //Line to JSON
				var turf = tweetAsGeoJson(tTweet); //Tweet to GeoJSON Point
				if (turf) { //Got a point?

					turf.properties.id = tTweet.id_str;
					turf.properties.text = tTweet.text;
					turf.properties.user_id = tTweet.user.id_str;
					turf.properties.screen_name = tTweet.user.screen_name;
					turf.properties.country = findCountry(turf); //Find country for point
					if (turf.properties.country != 'Not Found') { //Country not found?
					
						turf.properties.state=findState(turf.properties.country,turf);
						if(turf.properties.state == 'Not Found') {
							stateNotFound++;
						}			
					
						turf.properties.timezone = findTimeZone(turf); //Find Timezone for Point
						if (turf.properties.timezone == 'Antarctica/' || turf.properties.timezone == 'Antarctica/Central' || turf.properties.timezone == 'Antarctica/Mirny') { //Antarctica?
							//In every timezone (excluded)
							antarctica++;
							insert('timezone',turf);
						} else if (turf.properties.timezone == null || turf.properties.timezone == 'Not Found') { //Null timezone?
							//Arctic in every timezone (excluded)
							noTimeZone++;
							insert('timezone',turf);
						} else { //No problem
							var m = (new moment(tTweet.created_at, dateFormat)).tz(turf.properties.timezone, 'YYYY-MM-DDTHH:mm:ssZ');
							turf.properties.local_timestamp = m.format(dateFormat);
							turf.properties.local_hour = m.format('HH');
							turf.properties.local_doy = m.format('DDD');
							turf.properties.local_dow = m.format('dddd');
							sum(turf.properties.country, turf.properties.point);
							insert('twitter',turf);

						}
					} else {
						//A Person without a country
						countryNotFound++;
						insert('country',turf);
					}
				} else {
					noGeoCode++;
					insert('geo',tTweet);
				}

			} catch (e) {
				console.error(JSON.parse(line));
				console.error(JSON.stringify(turf));
				console.error(tTweet.created_at);
				console.error(turf.properties.timezone);
				console.error(e);
			}
		}
	}).then(function() {

		//Output general file stats
		console.error('Tweets Stats:\n\tTotal Read: ' + lines + '\n\tTwitter Points: ' + summary.points + '\n\tTwitter Place: ' + summary.places + '\n\tNo Geo Coding: ' + noGeoCode + '\n\tNo Country Found: ' + countryNotFound + '\n\tNo State Found: ' + stateNotFound + '\n\tAntartica: ' + antarctica + '\n\tNo Time Zone: ' + noTimeZone);
		
		closeDb();
	});

};
var insert = function(collection, obj) {
	//TODO Consider using a Batch as it could provide speed increases
	
	inserts++;
	db.collection(collection).insert(obj,{w: 1,safe: true}, function(err, rec) {
		 if (err) {
		 	 console.error('ERROR: ' + err.message);
		 	 if(err.message.indexOf("duplicate key error") > -1) {
				insertsComplete++;		 	 
		 	 }
		 } else { 
		 	insertsComplete++; 
		 }
	});
}
var closeDb = function() {
	if(inserts == insertsComplete) {
		db.close();
	} else {
		if(lastCompleted != insertsComplete) {
			console.log(insertsComplete+'/'+inserts);
			lastCompleted=insertsComplete;		
		}
		setTimeout(closeDb,1000);	
	}	
}
var dbLoaded = function(err, database) {
	if (err) {
		console.error(err.message);
	}
	db = database;
	console.log('Database Connected');
	processFile();
};
require('mongodb').MongoClient.connect(pkg.config.db_url, dbLoaded);
