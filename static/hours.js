var hours = (function() {
var world; //World Hour summary cache
var data; //Active location data
var media_data;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


var drawHours = function() {
	console.log('drawHours');

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

	var x = d3.scale.ordinal().rangeRoundBands([0, width]);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom');

	var yAxis = d3.svg.axis().scale(y).orient('left');

	x.domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]);
  	y.domain([0,d3.max(data,function(d) { return d; })]);


	var svg = d3.select('#hourChart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

	svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Tweets');


	svg.selectAll('.bar')
      .data(data)
    .enter().append('rect')
      .attr('class', 'bar' )
      .attr('y', function(d,i) { return y(d); })
      .attr('width', x.rangeBand())
      .attr('x', function(d,i) { return x(i); })
      .attr('height', function(d) { return height - y(d); })
      .append("svg:title")
				.text(function(d, i) {
					if(i == 0) {
						return 'Midnight: '+numberWithCommas(d)+' tweets';
					} else {
						return 'Hour '+i+': '+numberWithCommas(d)+' tweets';
					}

				});
	console.log('done');

};
var drawMediaHours = function() {
	console.log('drawMediaHours');

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

	var x = d3.scale.ordinal().rangeRoundBands([0, width]);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom');

	var yAxis = d3.svg.axis().scale(y).orient('left');

	x.domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]);
  	y.domain([0,d3.max(media_data,function(d) { return d; })]);


	var svg = d3.select('#hourMediaChart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

	svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
    .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Tweets');


	svg.selectAll('.bar')
      .data(media_data)
    .enter().append('rect')
      .attr('class', 'bar' )
      .attr('y', function(d,i) { return y(d); })
      .attr('width', x.rangeBand())
      .attr('x', function(d,i) { return x(i); })
      .attr('height', function(d) { return height - y(d); })
      .append("svg:title")
				.text(function(d, i) {
					if(i == 0) {
						return 'Midnight: '+numberWithCommas(d)+' media tweets';
					} else {
						return 'Hour '+i+': '+numberWithCommas(d)+' media tweets';
					}

				});
	console.log('done');

};

var countrySelect = function() {
	//Build a drop-down list of countries
	var select = document.createElement('select');
	select.id="countrySelector";
	select.onchange=countrySelected;

	var opt=null;

	//For each key in the World Hour summary data
	for(var key in world) {
		if(world[key].hour) { //Make sure we have an hour array
			if(opt == null) {
				data = world[key].hour;
				media_data = world[key].country_media;
				drawHours();
				drawMediaHours();
			}
			//Add the country to the list
			opt = document.createElement('option');
			opt.value=key;
			opt.text=key;
			select.appendChild(opt);
		}
	}
	//Add the country drop-down to the page
	document.getElementById('hourCountrySelect').appendChild(select);
};

var countrySelected = function() {
	//Find selected coutnry
	var sel = document.getElementById('countrySelector');
	var key = sel[sel.selectedIndex].value;
	//Set country data
	data = world[key].hour;
	media_data = world[key].country_media;

	//remove old chart
	var c = document.getElementById("hourChart");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	var c = document.getElementById("hourMediaChart");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}

	//Draw new chart
	drawHours();
	drawMediaHours();
};


//Load the World Hour summary
d3.json("/summary?location=World%20Hour", function(error, json) {
	console.log('Got World Hour data');
	if (error) { return console.warn(error); }
	world = json; //Cache the full summary report
	data = world.hour; //Default the World report for charting

});

var cleanUp = function() {
	console.log('cleanUp');
	var c = document.getElementById('hourChart');
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	c.style.height='auto';

	c = document.getElementById("hourCountrySelect");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	c.style.height='auto';
	
	c = document.getElementById("hourMediaChart");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	c.style.height='auto';

};


	return {
		showIt: function() {
			if(data) {
				cleanUp();
				countrySelect(); //Add the drop-down country list to the page
			} else {
				setTimeout(showIt,500);
			}
		}
	};
})();
