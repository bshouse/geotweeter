var assetLoader = (function() {

  var worldSummary;
  var stateGeo;
  var countrySummary={};

  console.log('Loading GeoJSON for States/Provinces');
  var states;
  var reqStates = new XMLHttpRequest();
  reqStates.open("GET","ne_10m_admin_1_states_provinces.json", true);
  reqStates.addEventListener("load", function () {
    console.log('State/province geometry loaded');
    stateGeo = JSON.parse(reqStates.responseText);
  });
  reqStates.send(null);


  console.log('Loading World Hot Spot Summary');
  var req = new XMLHttpRequest();
  req.open("GET", "/summary", true);
  req.addEventListener("load", function() {
    worldSummary = JSON.parse(req.responseText);
    console.log("loaded world Hot Spot Summary");
  });
  req.send(null);

  var _getCountryTweetSummary = function(country,callback) {
    if(countrySummary[country]) {
      callback(countrySummary[country]);
    } else {
      var reqCountrySummary = new XMLHttpRequest();
      reqCountrySummary.open("GET", "/summary?location="+country, true);
      reqCountrySummary.addEventListener("load", function() {
        console.log('Country Summary loaded for: '+country);
        countrySummary[country] = JSON.parse(reqCountrySummary.responseText);
        callback(countrySummary[country]);
      });
      reqCountrySummary.send(null);
    }

  };




  return {
    getWorldTweetSummary: function() {
      return worldSummary;
    },
    getStateGeo: function() {
      return stateGeo;
    },
    getCountryTweetSummary: function(country,callback) {
      return _getCountryTweetSummary(country,callback);
    }

  };


})();
