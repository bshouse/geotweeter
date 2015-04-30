var users = (function() {

var world; //ScreenName summary

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function repackTweetCounts(dataIn) {
	var data=[];
	var offset=1;
	for(var x = 0; x+offset < dataIn.length; x++) {
		if(dataIn[x+offset] === undefined) {
			break;
		}

		//Exclude 0 count
		while(dataIn[x+offset].count == 0) {
				offset++;
				if(x+offset == dataIn.length) {
					break;
				}
		}
		if(dataIn[x+offset] === undefined) {
			break;
		}
		data[x]={};
		data[x].name=dataIn[x+offset].name;
		data[x].value=dataIn[x+offset].count;
	}
	var hundreds = dataIn.length-101;
	return {'children': data,'name': 'tweets'};
}
function repackChangeCounts(dataIn) {
	var data=[];
	var offset=1;
	for(var x = 0; x+offset < dataIn.length; x++) {
		if(dataIn[x+offset] === undefined) {
			break;
		}

		//Exclude 0 count
		while(dataIn[x+offset].count == 0) {
				offset++;
				if(x+offset == dataIn.length) {
					break;
				}
		}
		if(dataIn[x+offset] === undefined) {
			break;
		}
		data[x]={};
		data[x].name=dataIn[x+offset].name;
		data[x].value=dataIn[x+offset].count;
	}
	return {'children': data,'name': 'Screen Name Changes'};
}



var drawSmallCounts = function(data,div) {
	console.log('drawSmallCounts: '+div);

var diameter = 500,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter-15, diameter])
    .padding(235);

var svg = d3.select("#"+div).append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

	var node = svg.selectAll(".node")
      .data(bubble.nodes(data))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("title")
      	.text(function(d) {return numberWithCommas(d.value) + " users with "+d.name; });

   node.append("circle")
      	.attr("r", function(d) { return d.r; })
      	.style("fill", function(d) { return color(d.name); });

	node.append("text")
      	.attr("dy", ".3em")
      	.style("text-anchor", "start")
      	.text(function(d) { if(d.name)  { return d.name.substring(0,d.name.length-7); } else { return ""; } });


	d3.select("#"+div).style("height", diameter + "px");	console.log('done');
};


var drawNameChanges = function(data,div) {
	console.log('drawNameChanges: '+div);

var diameter = 500,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter-15, diameter])
    .padding(100);

var svg = d3.select("#"+div).append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

	var node = svg.selectAll(".node")
      .data(bubble.nodes(data))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("title")
      	.text(function(d) {return numberWithCommas(d.value) + " users with "+d.name; });

   node.append("circle")
      	.attr("r", function(d) { return d.r; })
      	.style("fill", function(d) { return color(d.name); });

	node.append("text")
      	.attr("dy", ".3em")
      	.style("text-anchor", "start")
      	.text(function(d) { if(d.name)  { return d.name.substring(0,d.name.indexOf(' ')); } else { return ""; } });


	d3.select("#"+div).style("height", diameter + "px");	console.log('done');
};


//Load the ScreenName summary
d3.json("/summary?location=ScreenName", function(error, json) {
	console.log('Got ScreenName data');
	if (error) { return console.warn(error); }
	world = json; //Cache the full summary report

});
var cleanUp = function() {
	console.log('cleanUp');
	var c = document.getElementById("screenNameChart");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
  c.style.height='auto';
	var c = document.getElementById("smallCountsChart");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
  c.style.height='auto';

};


var kickOff = function() {
  if(world) {
    cleanUp();
    drawSmallCounts(repackTweetCounts(world.smallCounts),'smallCountsChart');
    drawNameChanges(repackChangeCounts(world.smallNames),'screenNameChart');
  } else {
    setTimeout(kickOff,500);
  }

}


  return {
    showIt: function() {
      console.log('users.showIt');
      kickOff();
    }
  };

})();
