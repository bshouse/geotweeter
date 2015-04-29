/** @jsx React.DOM */
'use strict';

var Tabs = ReactSimpleTabs;
var App = React.createClass({
  onMount: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('on mount, showing tab ' + selectedIndex);
    hotspot.showIt(assetLoader);
  },
  onBeforeChange: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('before the tab ' + selectedIndex);
  },
  onAfterChange: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('after the tab ' + selectedIndex);
    switch(selectedIndex) {
      case 1:
        hotspot.showIt(assetLoader);
        break;
      case 2:
        media.showIt(assetLoader);
        break;
      case 3:
        days.showIt();
        break;
      case 4:
        hours.showIt();
        break;
      case 5:
        users.showIt();
        break;
      case 6:
        travel.showIt();
        break;
      case 7:
        smiley.showIt(assetLoader);
        break;
      default:
        console.log('unknown tab: '+selectedIndex)
        break;

    }
  },
  render: function() {
    return (
      <Tabs tabActive={1} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
        <Tabs.Panel title='Hot Spots'>
          <h2>Geo Tweets by Country</h2>
          <div id='world'></div>
          <div id='country'></div>
        </Tabs.Panel>
        <Tabs.Panel title='Media Hot Spots'>
          <h2>Geo Tweets with Images</h2>
          <div id='mediaWorld'></div>
          <div id='mediaCountry'></div>
        </Tabs.Panel>
        <Tabs.Panel title='Peak Days'>
          <table>
            <tr>
              <th><h2>Peak Geo Tweeting Days by Country</h2></th>
              <th><h2>Peak Media Geo Tweeting Days by Country</h2></th>
            </tr>
            <tr>
              <td><div id='dayCountrySelect'></div></td>
              <td><div id='dayMediaSelect'></div></td>
            </tr>
            <tr>
              <td><div id='dayCountryChart'></div></td>
              <td><div id='dayMediaChart'></div></td>
            </tr>
          </table>
        </Tabs.Panel>
        <Tabs.Panel title='Peak Hours'>
          <h2>Peak Geo Tweeting Hours by Country</h2>
          <div id='hourCountrySelect'></div>
          <div id='hourChart'></div>
        </Tabs.Panel>
        <Tabs.Panel title='Users'>
          <table>
            <tr>
              <th><h2>Number of users by Tweet count.</h2></th>
              <th><h2>Screen Names Changes</h2></th>
            </tr>
            <tr>
              <td><div id="smallCountsChart"></div></td>
              <td><div id="screenNameChart"></div></td>
            </tr>
          </table>
        </Tabs.Panel>
        <Tabs.Panel title='Travel'>
        <table>
          <tr>
            <th><h2>Number of users by Country count.</h2></th>
            <th><h2>Number of users by State/Province count.</h2></th>
          </tr>
          <tr>
            <td><div id="countryTravelChart"></div></td>
            <td><div id="stateTravelChart"></div></td>
          </tr>
        </table>
        </Tabs.Panel>
        <Tabs.Panel title='Smiley Tweets'>
        <table>
          <tr>
            <th><h2>Smiley Tweets</h2></th>
          </tr>
          <tr>
            <td><div id="worldText"></div></td>
            <td><div id="worldTextLegend"></div></td>
          </tr>
        </table>
        </Tabs.Panel>
      </Tabs>
    );
  }
});

React.renderComponent(<App />, document.getElementById('tabs'));
