var travel = (function() {

var travel; //travel summary

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


var drawCountries = function(data,div) {
	console.log('drawCountries: '+div);

var diameter = 500,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter-50, diameter])
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
      	.text(function(d) { if(d.name)  { return d.name; } else { return ""; } });


	d3.select("#"+div).style("height", diameter + "px");	console.log('done');
};


var drawStates = function(data,div) {
	console.log('drawStates: '+div);

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
      	.text(function(d) { if(d.name)  { return d.name.substring(0,d.name.length-17); } else { return ""; } });


	d3.select("#"+div).style("height", diameter + "px");	console.log('done');
};


//Load the Travel summary
d3.json("/summary?location=Travel", function(error, json) {
	console.log('Got Travel data');
	if (error) { return console.warn(error); }
	travel = json; //Cache the full summary report

});
var cleanUp = function() {
	console.log('cleanUp');
	var c = document.getElementById("stateTravelChart");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	var c = document.getElementById("countryTravelChart");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}

};


  return {
    showIt: function() {
      console.log('travel.showIt');
      if(travel) {
        cleanUp();
        drawCountries({'children': travel.smallCountries,'name': 'countries'},'countryTravelChart');
      	drawStates({'children': travel.smallStates,'name': 'states'},'stateTravelChart');
      } else {
        setTimeout(showIt,500);
      }
    }
  };

})();
