if (process.argv.length != 3) {
	console.error("Syntax: node " + process.argv[1] + " [Input.json]");
	process.exit();
}

//Load modules
var fs = require('fs');

//Load GeoJSON
var geo = require(process.argv[2]); //GeoJSON

//Problem logging
function log(file, message) {
	fs.appendFile(file, message + "\n", function(err) {
		if (err) {
			console.error(file + ": " + message);
		}
	});
};

function removeMongoPosion(obj){
	if(obj.type && obj.type == 'FeatureCollection') {
		for(var x = 0; x < obj.features.length; x++) {
			if(obj.features[x].properties.admin) {
			obj.features[x].properties.admin=obj.features[x].properties.admin.replace(/\./g,'');
			}
			if(obj.features[x].properties.ADMIN) {
				obj.features[x].properties.ADMIN=obj.features[x].properties.ADMIN.replace(/\./g,'');
			}
			if(obj.features[x].properties.name) {
				obj.features[x].properties.name=obj.features[x].properties.name.replace(/\./g,'');
			}
		}
	}
	
}
removeMongoPosion(geo);

log(process.argv[2]+".clean",JSON.stringify(geo,null,0));
