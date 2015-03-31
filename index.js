var pkg = require('./package.json'); //Application Settings
var express = require('express');
var app = express();
var db;


/*
 *
 * MongoDB Connection Setup
 * 
 */
var dbLoaded = function(err, database) {
	if (err) {
		console.error(err.message);
		process.exit(0);
	}
	db = database;
	console.log('Database Connected');
};
require('mongodb').MongoClient.connect(pkg.config.db_url, dbLoaded);




/*
 *
 * Express Events
 * 
 */
app.get('/', function(req, res) {
	
	//Default page
	res.sendFile('world.html', { root: __dirname + "/static" } );
});

app.get('/summary', function(req, res) {
	
	//Find requested location
	var loc = req.query.location;
	if(!loc) { //No location requested
		loc='World'; //Default to world
	}
	console.log('Sending summary: '+loc);
	//Lookup summary for location
	db.collection('summary').find({'name': loc},
	 function(err, cursor) {
		if (err) {
			errorHandler(err.message,req,res);
		} else {
			cursor.toArray(function(err, arr) {
				if(err) {
					errorHandler(err.message,req,res);
				} else {
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(arr[0]));
				} 
			});
			
		}
	});
});





/*
 *
 * Express Setup
 * 
 */

//Start Express
var http = app.listen(3000, '127.0.0.1',function() {

	var host = http.address().address;
	var port = http.address().port;

	console.log('Express listening at http://%s:%s', host, port);

});

app.use(express.static('static')); //Set static file path
app.use(errorHandler); //Error Handler: Must be the final app.use()

//Generic error handler
function errorHandler(err, req, res, next) {
	console.error(err);
	res.status(500);
	res.render('error', {
		error: err
	});
}






/*
 *
 * Node Clean Exit
 * 
 */

// Execute commands in clean exit
process.on('exit', function() {
	console.log('Exiting ...');
	try {
		db.close(); //Close MongoDB Connection
	} catch (e) {}
	try {
		http.close(); //Close Express
	} catch (e) {}
	console.log('bye');
});

// happens when you press Ctrl+C
process.on('SIGINT', function() {
	console.log('\nGracefully shutting down on SIGINT (Crtl-C)');
	try {
		db.close(); //Close MongoDB Connection
	} catch (e) {}

	process.exit();
});

// usually called with kill
process.on('SIGTERM', function() {
	console.log('Parent SIGTERM detected (kill)');
	process.exit(0);
});
