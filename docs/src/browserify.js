'use strict';

// it should actually be loaded as a dependency like this
// const hcSticky = require('hc-sticky');

const hcSticky = require('../../dist/hc-sticky.js');

const Sticky = new hcSticky('aside', {
  stickTo: 'main',
  responsive: {
    980: {
      disable: true
    }
  }
});
