var smiley = (function () {
console.log('init');
var assets;
var worldTextSummary;
var states;
console.log('Loading World Text Summary');
var req = new XMLHttpRequest();

req.open("GET", "/summary?location=World Text", true);
req.addEventListener("load", function() {
  worldTextSummary = JSON.parse(req.responseText);
  console.log("Loaded World Text Summary");
});
req.send(null);


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};



function worldText(countryGeo) {
  console.log('builing map');

  var width = 700;
  var height = 700;


  var projection = d3.geo.azimuthalEquidistant().scale(1).translate([0,0]);
  var path = d3.geo.path().projection(projection);

  var vis = d3.select("#worldText").append("svg").attr("width", width).attr("height", height);


  var bounds = path.bounds(countryGeo);
  var s = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
  var t = [(width - s * (bounds[1][0] + bounds[0][0])) / 2, (height - s * (bounds[1][1] + bounds[0][1])) / 2];

  projection
    .scale(s)
      .translate(t);

      //Diagonal Hatch for no HeatMap
  vis.append('defs')
    .append('pattern')
      .attr('id', 'diagonalHatch')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 4)
      .attr('height', 4)
    .append('path')
      .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
      .attr('stroke', '#222')
      .attr('stroke-width', 1);

  vis.append("g")
    .attr("class", "countries" )
    .attr("title", "Countries of the World")
    .selectAll("path")
      .data(countryGeo.features)
      .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#222")
        .attr("fill", function(d) { return (worldTextSummary[d.properties["ADMIN"]] ? worldTextSummary[d.properties["ADMIN"]].heat : "url(#diagonalHatch)");} )
      .append("svg:title")
        .text(function(d, i) {
          if(worldTextSummary[d.properties["ADMIN"]]) {
            return d.properties["ADMIN"]+" "+numberWithCommas(worldTextSummary[d.properties["ADMIN"]].textMatch) +" of "+numberWithCommas(worldTextSummary[d.properties["ADMIN"]].total)+" tweets";
          } else {
            return d.properties["ADMIN"];
          }
        });
  console.log("map svg done");
};

var drawLegend = function(div) {
  console.log('drawCountryDays');

  var width = 50;
  var height = 100;
  var vis = d3.select("#"+div).append("svg").attr("width", width).attr("height", height);

  vis.append("svg")
     .attr("width", 200)
     .attr("height", 200);

  vis.append("rect")
     .attr("x", 10)
     .attr("y", 10)
     .attr("width", 50)
     .attr("height", 100);
};


var emptyCountry = function() {
  myNode = document.getElementById("worldText");
  while (myNode.firstChild) {
     myNode.removeChild(myNode.firstChild);
  }
};

var kickOff = function() {
  states = assets.getStateGeo();
  if(worldTextSummary && states) {
    emptyCountry();
    worldText(c);
    drawLegend('worldTextLegend');
  } else {
    setTimeout(kickOff,1000);
  }
};

  return {
    showIt: function(assetLoader) {
      console.log('showIt');
      assets=assetLoader;
      kickOff();
    }
  };

})();
