var days = (function() {

var countryDiv="dayCountryChart";
var mediaDiv="dayMediaChart";
var world; //World Day summary cache
var data; //Active location data
var media_data;

var drawCountryDays = function(chartDiv) {
	console.log('drawCountryDays');
	var names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

	var x = d3.scale.ordinal().rangeRoundBands([0, width]);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(function(d,i) { return names[i]; });

	var yAxis = d3.svg.axis().scale(y).orient('left');

	//data.map(function(d,i) { return i; })
	x.domain([0,1,2,3,4,5,6]);
  	y.domain([0,d3.max(data,function(d) { return d; })]);


	var svg = d3.select('#'+chartDiv).append('svg')
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
					return names[i]+': '+d+' tweets';

				});
	console.log('done');

};

var drawMediaDays = function(chartDiv) {
	console.log('drawMediaDays');
	var names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
	var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

	var x = d3.scale.ordinal().rangeRoundBands([0, width]);

	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(function(d,i) { return names[i]; });

	var yAxis = d3.svg.axis().scale(y).orient('left');

	//data.map(function(d,i) { return i; })
	x.domain([0,1,2,3,4,5,6]);
  	y.domain([0,d3.max(media_data,function(d) { return d; })]);


	var svg = d3.select('#'+chartDiv).append('svg')
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
					return names[i]+': '+d+' image tweets';
				});
	console.log('drawMediaDays: done');

};


var countrySelected = function() {
	//Find selected coutnry
	var sel = document.getElementById('countrySelector');
	var key = sel[sel.selectedIndex].value;
	//Set country data
	data = world[key].day;
	media_data = world[key].country_media;

	//remove old chart
	var c = document.getElementById(countryDiv);
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	//Draw new chart
	drawCountryDays(countryDiv);

	var c = document.getElementById(mediaDiv);
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	//Draw new chart
	drawMediaDays(mediaDiv);


};
var countrySelect = function() {
	//Build a drop-down list of countries
	var select = document.createElement('select');
	select.id="countrySelector";
	select.onchange=countrySelected;

	var opt=null;
	//For each key in the World Day summary data
	for(var key in world) {
		if(world[key].day) { //Make sure we have an day array
			//Add the country to the list
			if(opt == null) {
				data = world[key].day;
				drawCountryDays(countryDiv); //Chart the world tweeting days
				media_data = world[key].country_media;
				drawMediaDays(mediaDiv); //Chart the world tweeting days
			}
			opt = document.createElement('option');
			opt.value=key;
			opt.text=key;
			select.appendChild(opt);
		}

	}
	//Add the country drop-down to the page
	document.getElementById('dayCountrySelect').appendChild(select);
};


var cleanUp = function() {
	console.log('cleanUp');
	var c = document.getElementById(countryDiv);
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	c = document.getElementById("dayCountrySelect");
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	c.style.height='auto';

	c = document.getElementById(mediaDiv);
	while (c.firstChild) {
   	c.removeChild(c.firstChild);
	}
	c.style.height='auto';

};

//Load the World Day summary
d3.json("/summary?location=World%20Day", function(error, json) {
	console.log('Got World Day data');
	if (error) { return console.warn(error); }
	world = json; //Cache the full summary report
	data = world.day; //Default the World report for charting
});
	return {
		showIt: function() {
			console.log('showIt');
      if(data) {
				cleanUp();
				countrySelect(); //Add the drop-down country list to the page
      } else {
        setTimeout(showIt,500);
      }
		}
	}

})();
