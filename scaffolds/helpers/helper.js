---
install:
  devDependencies: ['mocha']
rename:
  basename: 'test.js'
---
'use strict';

require('mocha');
var assert = require('assert');
var helper = require('<%= relative(dest) %>');

describe('<%= name %>', function() {
  describe('helper', function() {
    it('should work as a function', function() {
      assert.equal(helper(), '');
    });
  });
});

