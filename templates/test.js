'use strict';

require('mocha');
var assert = require('assert');
var <%= varname %> = require('<%= relativeDir %>');

describe('<%= name %>', function() {
  it('should export a function', function() {
    assert.equal(typeof <%= varname %>, 'function');
  });

  it('should export an object', function() {
    assert(<%= varname %>);
    assert.equal(typeof <%= varname %>, 'object');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      <%= varname %>();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a string');
      assert.equal(err.message, 'expected callback to be a function');
      cb();
    }
  });
});
