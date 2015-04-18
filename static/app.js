/** @jsx React.DOM */
'use strict';

var Tabs = ReactSimpleTabs;
var App = React.createClass({
  onMount: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('on mount, showing tab ' + selectedIndex);
    hotspot.showIt();
  },
  onBeforeChange: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('before the tab ' + selectedIndex);
  },
  onAfterChange: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('after the tab ' + selectedIndex);
    switch(selectedIndex) {
      case 1:
        hotspot.showIt();
        break;
      case 2:
        days.showIt();
        break;
      case 3:
        hours.showIt();
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
        <Tabs.Panel title='Peak Days'>
          <h2>Peak Geo Tweeting Days by Country</h2>
          <div id='dayCountrySelect'></div>
          <div id='dayChart'></div>
        </Tabs.Panel>
        <Tabs.Panel title='Peak Hours'>
          <h2>Peak Geo Tweeting Hours by Country</h2>
          <div id='hourCountrySelect'></div>
          <div id='hourChart'></div>
        </Tabs.Panel>
        <Tabs.Panel title='Twitter Tables'>
          <h2>Twitter Tables Go here</h2>
        </Tabs.Panel>
      </Tabs>
    );
  }
});

React.renderComponent(<App />, document.getElementById('tabs'));
