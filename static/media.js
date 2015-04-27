var media = (function () {
console.log('init');
var worldHotSpotSummary;



console.log('Loading World Media Hot Spot Summary');
var req = new XMLHttpRequest();
req.open("GET", "/summary", true);
req.addEventListener("load", function() {
  worldHotSpotSummary = JSON.parse(req.responseText);
  console.log("loaded world Media Hot Spot Summary");
});
req.send(null);

console.log('Loading GeoJSON for States/Provinces');
var states;
var reqStates = new XMLHttpRequest();
reqStates.open("GET","ne_10m_admin_1_states_provinces.json", true);
reqStates.addEventListener("load", function () {
  console.log('State/province geometry loaded');
  states = JSON.parse(reqStates.responseText);
});
reqStates.send(null);


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};



function worldHotspots(countryGeo) {
  console.log('builing map');

  var width = 700;
  var height = 700;


  var projection = d3.geo.azimuthalEquidistant().scale(1).translate([0,0]);
  var path = d3.geo.path().projection(projection);

  var vis = d3.select("#mediaWorld").append("svg").attr("width", width).attr("height", height);


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
        .attr("fill", function(d) { return (worldHotSpotSummary[d.properties["ADMIN"]] ? worldHotSpotSummary[d.properties["ADMIN"]].mediaHeat : "url(#diagonalHatch)");} )
      .append("svg:title")
        .text(function(d, i) {
          if(worldHotSpotSummary[d.properties["ADMIN"]]) {
            return d.properties["ADMIN"]+" "+numberWithCommas(worldHotSpotSummary[d.properties["ADMIN"]].media) +" of "+numberWithCommas(worldHotSpotSummary.media)+" tweets";
          } else {
            return d.properties["ADMIN"];
          }
        });
  console.log("map svg done");
};

var country=null;
var countryHotSpotSummary=null;
function countryHotSpots() {
  console.log("Creating Country Hot Spot Map");
  var width = 500;
  var height = 500;

  var projection;
  if(countryHotSpotSummary.name == "United States of America") {
    console.log("USA");
    projection = d3.geo.albersUsa().scale(1).translate([0,0]);
  } else {
    console.log("Other");
    projection = d3.geo.stereographic().scale(1).translate([0,0]);
  }

  var path = d3.geo.path().projection(projection);

  var svg = document.createElement('div');

  var vis = d3.select(svg)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  var bounds = path.bounds(country);
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
      .attr("title", "test title")
    .selectAll("path")
      .data(country.features)
      .enter().append("path")
        .attr("d", path)
        .attr("stroke", "#222")
        .attr("fill", function(d) { return (countryHotSpotSummary[d.properties["name"]] ? countryHotSpotSummary[d.properties["name"]].mediaHeat : "url(#diagonalHatch)");} )
      .append("svg:title")
        .text(function(d, i) {
          if(countryHotSpotSummary[d.properties.name]) {
            return d.properties.name+" "+numberWithCommas(countryHotSpotSummary[d.properties.name].media) +" of "+numberWithCommas(countryHotSpotSummary.media)+" tweets";
          } else {
            return d.properties.name;
          }
        });

        alertify.defaults.glossary.title=countryHotSpotSummary.name;
        alertify.alert(svg).set('resizable',true).resizeTo(700,640);
        console.log("Map svg done: "+countryHotSpotSummary.name);
};

var buildMap = function(countryName) {
  console.log('Building map geometry for '+countryName);
  tCountry={};
  tCountry.type="FeatureCollection";
  tCountry.features=[];
  for(var y = 0; y < states.features.length; y++) {
    if(states.features[y].properties.admin == countryName) {
      tCountry.features[tCountry.features.length]=states.features[y];
    }
  }
  country=tCountry;
};



var getCountrySummary = function(countryName) {
  buildMap(countryName);
  var reqCountrySummary = new XMLHttpRequest();
  reqCountrySummary.open("GET", "/summary?location="+countryName, true);
  reqCountrySummary.addEventListener("load", function() {
    console.log('Country Summary loaded for: '+countryName);
    countryHotSpotSummary = JSON.parse(reqCountrySummary.responseText);
    countryHotSpots();
  });
  reqCountrySummary.send(null);
  emptyCountry();
};
var emptyCountry = function() {
  var myNode = document.getElementById("mediaCountry");
  while (myNode.firstChild) {
     myNode.removeChild(myNode.firstChild);
  }
  myNode = document.getElementById("mediaWorld");
  while (myNode.firstChild) {
     myNode.removeChild(myNode.firstChild);
  }
};

var kickOff = function() {
  emptyCountry();
  worldHotspots(c);
};

  return {
    showIt: function() {
      console.log('showIt');
      if(worldHotSpotSummary) {
        kickOff();
      } else {
        setTimeout(kickOff,1000);
      }
    }
  };

})();
