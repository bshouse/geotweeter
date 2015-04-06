var pkg = require('../package.json'); //Application Settings
var fs = require('fs');
var db;
var collection; //Twitter Collection
var summaryLength = 26;
var summary = {}; //Tweets by country, total tweets, place/point geotag
summary.name="World Hour";
summary.total = 0;
summary.hour=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var countries;


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
		"properties.local_hour": "00"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[0]: " + err.message);
		} else {
			summary.hour[0] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "01"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[1]: " + err.message);
		} else {
			summary.hour[1] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "02"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[2]: " + err.message);
		} else {
			summary.hour[2] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "03"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[3]: " + err.message);
		} else {
			summary.hour[3] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "04"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[4]: " + err.message);
		} else {
			summary.hour[4] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "05"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[5]: " + err.message);
		} else {
			summary.hour[5] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "06"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[6]: " + err.message);
		} else {
			summary.hour[6] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "07"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[7]: " + err.message);
		} else {
			summary.hour[7] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "08"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[8]: " + err.message);
		} else {
			summary.hour[8] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "09"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[9]: " + err.message);
		} else {
			summary.hour[9] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "10"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[10]: " + err.message);
		} else {
			summary.hour[10] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "11"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[11]: " + err.message);
		} else {
			summary.hour[11] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "12"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[12]: " + err.message);
		} else {
			summary.hour[12] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "13"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[13]: " + err.message);
		} else {
			summary.hour[13] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "14"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[14]: " + err.message);
		} else {
			summary.hour[14] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "15"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[15]: " + err.message);
		} else {
			summary.hour[15] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "16"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[16]: " + err.message);
		} else {
			summary.hour[16] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "17"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[17]: " + err.message);
		} else {
			summary.hour[17] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "18"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[18]: " + err.message);
		} else {
			summary.hour[18] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "19"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[19]: " + err.message);
		} else {
			summary.hour[19] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "20"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[20]: " + err.message);
		} else {
			summary.hour[20] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "21"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[21]: " + err.message);
		} else {
			summary.hour[21] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "22"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[22]: " + err.message);
		} else {
			summary.hour[22] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.local_hour": "23"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary.hour[23]: " + err.message);
		} else {
			summary.hour[23] = count;
		}
		wrapIt();
	});


	collection.distinct("properties.country", function(err, docs) {
		if (err) {
			console.error("Error - distinct countries: " + err.message);
		} else {
			countries = docs;
			summaryLength += (countries.length * 25);
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
	summary[country].hour=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
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
		"properties.local_hour": "00"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[0]: " + err.message);
		} else {
			summary[country].hour[0] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "01"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[1]: " + err.message);
		} else {
			summary[country].hour[1] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "02"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[2]: " + err.message);
		} else {
			summary[country].hour[2] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "03"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[3]: " + err.message);
		} else {
			summary[country].hour[3] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "04"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[4]: " + err.message);
		} else {
			summary[country].hour[4] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "05"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[5]: " + err.message);
		} else {
			summary[country].hour[5] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "06"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[6]: " + err.message);
		} else {
			summary[country].hour[6] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "07"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[7]: " + err.message);
		} else {
			summary[country].hour[7] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "08"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[8]: " + err.message);
		} else {
			summary[country].hour[8] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "09"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[9]: " + err.message);
		} else {
			summary[country].hour[9] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "10"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[10]: " + err.message);
		} else {
			summary[country].hour[10] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "11"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[11]: " + err.message);
		} else {
			summary[country].hour[11] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "12"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[12]: " + err.message);
		} else {
			summary[country].hour[12] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "13"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[13]: " + err.message);
		} else {
			summary[country].hour[13] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "14"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[14]: " + err.message);
		} else {
			summary[country].hour[14] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "15"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[15]: " + err.message);
		} else {
			summary[country].hour[15] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "16"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[16]: " + err.message);
		} else {
			summary[country].hour[16] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "17"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[17]: " + err.message);
		} else {
			summary[country].hour[17] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "18"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[18]: " + err.message);
		} else {
			summary[country].hour[18] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "19"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[19]: " + err.message);
		} else {
			summary[country].hour[19] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "20"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[20]: " + err.message);
		} else {
			summary[country].hour[20] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "21"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[21]: " + err.message);
		} else {
			summary[country].hour[21] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "22"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[22]: " + err.message);
		} else {
			summary[country].hour[22] = count;
		}
		wrapIt();
	});
	collection.count({
		"properties.country": country,
		"properties.local_hour": "23"
	}, {}, function(err, count) {
		if (err) {
			console.error("Error - summary['+country+'].hour[23]: " + err.message);
		} else {
			summary[country].hour[23] = count;
		}
		wrapIt();
	});


};


var wrapIt = function() {
	summaryLength -= 1;
	console.log('WrapIt: '+summaryLength)
	if (summaryLength == 0) {
		console.log('Saving World Hour Summary');
		db.collection('summary').update({"name": "World Hour"}, summary, {upsert: true, w:1, safe:true},function(err) { if(err) { console.error(err.message); } db.close(); });
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
