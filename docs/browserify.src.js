'use strict';

// it should actually be loaded as a dependency like this
// const hcSticky = require('hc-sticky');
// but since this is that repository we will use relative path

const hcSticky = require('../dist/hc-sticky.js');

const Sticky = new hcSticky('aside', {
  stickTo: 'main',
  responsive: {
    980: {
      disable: true
    }
  }
});
