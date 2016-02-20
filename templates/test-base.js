'use strict';

require('mocha');
var assert = require('assert');
var <%= alias %> = require('./');
var Base = require('base');
var app;

describe('<%= name %>', function() {
  beforeEach(function() {
    app = new Base();
    app.use(<%= alias %>());
  });

  it('should export a function', function() {
    assert.equal(typeof <%= alias %>, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      <%= alias %>();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a string');
      assert.equal(err.message, 'expected callback to be a function');
      cb();
    }
  });
});
