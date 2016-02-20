'use strict';

require('mocha');
var assert = require('assert');
var <%= alias %> = require('./');

describe('errors', function() {
  it('should throw an error when invalid args are passed', function(cb) {
    try {
      <%= alias %>();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected a string');
    }
  });
});
