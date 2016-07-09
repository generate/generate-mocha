'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var npm = require('npm-install-global');
var del = require('delete');
var generator = require('./');
var app;

var cwd = path.resolve.bind(path, __dirname, 'actual');

function exists(name, cb) {
  return function(err) {
    if (err) return cb(err);
    var filepath = cwd(name);
    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      del(path.dirname(filepath), cb);
    });
  };
}

describe('generate-<%= ask("name") %>', function() {
  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  beforeEach(function() {
    app = generate({silent: true});
    app.cwd = cwd();
    app.option('dest', cwd());
  });

  describe('plugin', function() {
    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === 'generate-<%= name %>') {
          count++;
        }
      });
      app.use(generator);
      app.use(generator);
      app.use(generator);
      assert.equal(count, 1);
      cb();
    });

    it('should extend tasks onto the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('<%= name %>'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(generator);
      app.build('default', exists('<%= ask("filename", "Filename to test for?") %>', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.use(generator);
      app.generate('default', exists('<%= filename %>', cb));
    });

    it('should run the `<%= name %>` task with .build', function(cb) {
      app.use(generator);
      app.build('<%= name %>', exists('<%= filename %>', cb));
    });

    it('should run the `<%= name %>` task with .generate', function(cb) {
      app.use(generator);
      app.generate('<%= name %>', exists('<%= filename %>', cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('generator (CLI)', function() {
      it('should run the default task using the `generate-<%= name %>` name', function(cb) {
        app.use(generator);
        app.generate('generate-<%= name %>', exists('<%= filename %>', cb));
      });

      it('should run the default task using the `<%= name %>` generator alias', function(cb) {
        app.use(generator);
        app.generate('<%= name %>', exists('<%= filename %>', cb));
      });
    });
  }

  describe('generator (API)', function() {
    it('should run the default task on the generator', function(cb) {
      app.register('<%= name %>', generator);
      app.generate('<%= name %>', exists('<%= filename %>', cb));
    });

    it('should run the `<%= name %>` task', function(cb) {
      app.register('<%= name %>', generator);
      app.generate('<%= name %>:<%= name %>', exists('<%= filename %>', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('<%= name %>', generator);
      app.generate('<%= name %>:default', exists('<%= filename %>', cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= name %>', generator);
      });
      app.generate('foo.<%= name %>', exists('<%= filename %>', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= name %>', generator);
      });
      app.generate('foo.<%= name %>', exists('<%= filename %>', cb));
    });

    it('should run the `<%= name %>:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= name %>', generator);
      });
      app.generate('foo.<%= name %>:default', exists('<%= filename %>', cb));
    });

    it('should run the `<%= name %>:<%= name %>` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= name %>', generator);
      });
      app.generate('foo.<%= name %>:<%= name %>', exists('<%= filename %>', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator)

      app.generate('foo.bar.baz', exists('<%= filename %>', cb));
    });
  });
});
