'use strict';

// it should actually be loaded like this:
// const hcSticky = require('hc-sticky');
const hcSticky = require('../../dist/hc-sticky.js');

const Sticky = new hcSticky('aside', {
  stickTo: 'main',
  queries: {
    980: {
      disable: true
    }
  }
});
