'use strict';

require('mocha');
var assert = require('assert');
var <%= alias %> = require('./');

describe('<%= name %>', function() {
  it('should export a function', function() {
    assert.equal(typeof <%= alias %>, 'function');
  });

  it('should export an object', function() {
    assert(<%= alias %>);
    assert.equal(typeof <%= alias %>, 'object');
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
