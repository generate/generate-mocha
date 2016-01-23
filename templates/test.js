'use strict';

require('mocha');
var assert = require('assert');
var download = require('./');
var Base = require('base');
var app;

describe('base-download', function() {
  beforeEach(function() {
    app = new Base();
    app.use(download());
  });

  it('should export a function', function() {
    assert.equal(typeof download, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      download();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a string');
      assert.equal(err.message, 'expected callback to be a function');
      cb();
    }
  });
});
