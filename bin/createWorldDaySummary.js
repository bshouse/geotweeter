var pkg = require('../package.json'); //Application Settings
var db;
var collection; //Twitter Collection
var summaryLength = 17; 
var summary = {}; //Tweets by country, total tweets, place/point geotag
summary.name="World Day";
summary.total = 0;
summary.day=[0,0,0,0,0,0,0];
summary.media = [0,0,0,0,0,0,0,0]; 
summary.media_total = 0; 
var countries;


var createDaySummary = function() {
	console.log("Starting createDaySummary");
	collection.count({}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.total: " + err.message);
		} else {
			summary.total = count;
		}
		wrapIt();
	});
	collection.count({"properties.media": {$ne: "Image Not Found"}}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media_total: " + err.message);
		} else {
			summary.media_total = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Monday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.day[0]: " + err.message);
		} else {
			summary.day[0] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Monday", 
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media[0]: " + err.message);
		} else {
			summary.media[0] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Tuesday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.day[1]: " + err.message);
		} else {
			summary.day[1] = count;
		}
		wrapIt();
	});	
	collection.count({
		"properties.local_dow": "Tuesday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media[1]: " + err.message);
		} else {
			summary.media[1] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Wednesday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.day[2]: " + err.message);
		} else {
			summary.day[2] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Wednesday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media[2]: " + err.message);
		} else {
			summary.media[2] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Thursday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.day[3]: " + err.message);
		} else {
			summary.day[3] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Thursday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media[3]: " + err.message);
		} else {
			summary.media[3] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Friday",
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.day[4]: " + err.message);
		} else {
			summary.day[4] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Friday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media[4]: " + err.message);
		} else {
			summary.media[4] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Saturday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.day[5]: " + err.message);
		} else {
			summary.day[5] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Saturday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media[5]: " + err.message);
		} else {
			summary.media[5] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Sunday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.day[6]: " + err.message);
		} else {
			summary.day[6] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_dow": "Sunday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.media[6]: " + err.message);
		} else {
			summary.media[6] = count;
		}
		wrapIt();
	});

	collection.distinct("properties.country", function(err, docs) {
		if (err) {
			console.error("Error - distinct countries: " + err.message);
		} else {
			countries = docs;
			summaryLength += (countries.length * 16);
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
	summary[country].day=[0,0,0,0,0,0,0];
	summary[country].country_media = [0,0,0,0,0,0,0,0]; 
	summary[country].country_media_total = 0; 
	
	collection.count({"properties.country": country}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].total: " + err.message);
		} else {
			summary[country].total = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Monday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].day[0]: " + err.message);
		} else {
			summary[country].day[0] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Tuesday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].day[1]: " + err.message);
		} else {
			summary[country].day[1] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Wednesday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].day[2]: " + err.message);
		} else {
			summary[country].day[2] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Thursday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].day[3]: " + err.message);
		} else {
			summary[country].day[3] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Friday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].day[4]: " + err.message);
		} else {
			summary[country].day[4] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Saturday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].day[5]: " + err.message);
		} else {
			summary[country].day[5] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Sunday"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].day[6]: " + err.message);
		} else {
			summary[country].day[6] = count;
		}
		wrapIt();
	});

	collection.count({"properties.country": country, "properties.media": {$ne: "Image Not Found"}}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media_total: " + err.message);
		} else {
			summary[country].country_media_total = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Monday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media[0]: " + err.message);
		} else {
			summary[country].country_media[0] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Tuesday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media[1]: " + err.message);
		} else {
			summary[country].country_media[1] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Wednesday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media[2]: " + err.message);
		} else {
			summary[country].country_media[2] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Thursday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media[3]: " + err.message);
		} else {
			summary[country].country_media[3] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Friday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media[4]: " + err.message);
		} else {
			summary[country].country_media[4] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Saturday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media[5]: " + err.message);
		} else {
			summary[country].country_media[5] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_dow": "Sunday",
		"properties.media": {$ne: "Image Not Found"}
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].country_media[6]: " + err.message);
		} else {
			summary[country].country_media[6] = count;
		}
		wrapIt();
	});

};


var wrapIt = function() {
	summaryLength -= 1;
	console.log('WrapIt: '+summaryLength)
	if (summaryLength == 0) {
		console.log('Saving World Day Summary');
		db.collection('summary').update({"name": "World Day"}, summary, {upsert: true, w:1, safe:true},function(err) { if(err) { console.error(err.message); } db.close(); });
	}
};

var dbLoaded = function(err, database) {
	if (err) {
		console.error(err.message);
	}
	db = database;
	collection = db.collection('twitter');
	console.log("Database Connected");
	createDaySummary();
};
require('mongodb').MongoClient.connect(pkg.config.db_url, dbLoaded);
