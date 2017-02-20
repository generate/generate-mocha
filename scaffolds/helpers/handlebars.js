---
install:
  devDependencies: ['mocha', 'handlebars']
rename:
  basename: 'test.js'
---
'use strict';

require('mocha');
var assert = require('assert');
var handlebars = require('handlebars');
var helper = require('<%= relative(dest) %>');

describe('<%= name %>', function() {
  describe('helper', function() {
    it('should work as a function', function() {
      assert.equal(helper(), '');
    });
  });

  describe('handlebars', function() {
    it('should work as a handlebars helper', function() {
      handlebars.registerHelper('<%= helperName(name) %>', helper);
      var fn = handlebars.compile('{{<%= helperName(name) %>}}');
      assert.equal(fn(), '');
    });
  });
});

