/** @jsx React.DOM */
'use strict';

var Tabs = ReactSimpleTabs;
var App = React.createClass({
  onMount: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('on mount, showing tab ' + selectedIndex);
  },
  onBeforeChange: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('before the tab ' + selectedIndex);
  },
  onAfterChange: function(selectedIndex, $selectedPanel, $selectedTabMenu) {
    console.log('after the tab ' + selectedIndex);
  },
  render: function() {
    return (
      <Tabs tabActive={1} onBeforeChange={this.onBeforeChange} onAfterChange={this.onAfterChange} onMount={this.onMount}>
        <Tabs.Panel title='World Map'>
          <h2>World Map Goes here</h2>
        </Tabs.Panel>
        <Tabs.Panel title='Country Map'>
          <h2>Country Map Goes here</h2>
        </Tabs.Panel>
        <Tabs.Panel title='Twitter Tables'>
          <h2>Twitter Tables Go here</h2>
        </Tabs.Panel>
      </Tabs>
    );
  }
});

React.renderComponent(<App />, document.getElementById('tabs'));
