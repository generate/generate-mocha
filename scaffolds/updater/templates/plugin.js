---
install:
  devDependencies: ['update']
rename:
  dirname: 'test'
  basename: 'plugin.js'
---
'use strict';

require('mocha');
var assert = require('assert');
var update = require('update');
var updater = require('<%= relative(dest) %>');
var app;

describe('<%= ask("name") %>', function() {
  beforeEach(function() {
    app = update();
  });

  describe('plugin', function() {
    it('should add tasks to the instance', function() {
      app.use(updater);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('<%= ask("alias") %>'));
    });

    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === '<%= ask("name") %>') {
          count++;
        }
      });
      app.use(updater);
      app.use(updater);
      app.use(updater);
      assert.equal(count, 1);
      cb();
    });
  });
});
