if (process.argv.length != 3) {
	console.error("Syntax: node " + process.argv[1] + " [package.json.value]");
	process.exit();
}

var path = require("path");
var bin = process.argv[1].substring(0,process.argv[1].lastIndexOf(path.sep));
//console.log("BIN: "+bin);
var root = bin.substring(0,bin.lastIndexOf(path.sep));
//console.log("App ROOT: "+root);
var pkg = require(root+path.sep+'package.json');

console.log(eval("pkg."+process.argv[2]));