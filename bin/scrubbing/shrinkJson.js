if (process.argv.length != 3) {
	console.error("Syntax: node " + process.argv[1] + " [InputTweetFile.json]");
	process.exit();
}

//Load modules
var fs = require('fs');

//Load GeoJSON
var geo = require(process.argv[2]); //Country GeoJSON

//Problem logging
function log(file, message) {
	fs.appendFile(file, message + "\n", function(err) {
		if (err) {
			console.error(file + ": " + message);
		}
	});
};

function removeNulls(obj){
	var isArray = obj instanceof Array;
	for (var k in obj){
		if (obj[k]===null) isArray ? obj.splice(k,1) : delete obj[k];
		else if (typeof obj[k]=="object") removeNulls(obj[k]);
	}
}
removeNulls(geo);

log(process.argv[2]+".shrink",JSON.stringify(geo,null,0));
