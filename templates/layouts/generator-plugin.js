---
install: ['generate', 'delete']
---
'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var generator = require('./');
var del = require('delete');
var app;

var actual = path.resolve.bind(path, __dirname, 'actual');

function exists(name, cb) {
  var filepath = actual(name);

  return function(err) {
    if (err) return cb(err);

    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      del(actual(), cb);
    });
  }
}

describe('generate-<%= alias %>', function() {
  <%= include("before-each-generator") %>

  describe('plugin', function() {
    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === 'generate-<%= alias %>') {
          count++;
        }
      });
      app.use(generator);
      app.use(generator);
      app.use(generator);
      assert.equal(count, 1);
      cb();
    });
  });

  describe('sub-generator', function() {
    it('should run tasks as a sub-generator', function(cb) {
      app = generate({silent: true, cli: true});

      app.generator('foo', function(sub) {
        sub.register('<%= alias %>', require('..'));
        sub.generate('<%= alias %>:unit-test', function(err) {
          if (err) return cb(err);
          assert.equal(app.base.get('cache.unit-test'), true);
          cb();
        });
      });
    });
  });

  describe('generator', function() {
    it('should work as a plugin', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('<%= alias %>'));
    });

    it('should work as a generator', function(cb) {
      app.register('<%= alias %>', generator);
      app.generate('<%= alias %>', exists('LICENSE', cb));
    });

    it('should run the `default` task', function(cb) {
      app.register('<%= alias %>', generator);
      app.generate('<%= alias %>:default', exists('LICENSE', cb));
    });

    it('should run the `foo` task', function(cb) {
      app.register('<%= alias %>', generator);
      app.generate('<%= alias %>:foo', exists('LICENSE', cb));
    });
  });
});
