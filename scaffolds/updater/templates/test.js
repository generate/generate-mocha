---
install:
  devDependencies: ['update', 'npm-install-global', 'delete', 'copy']
rename:
  dirname: 'test'
  basename: 'test.js'
---
'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var update = require('update');
var npm = require('npm-install-global');
var del = require('delete');
var copy = require('copy');
var updater = require('<%= relative(dest) %>');
var pkg = require('../package');
var app;

var cwd = path.resolve.bind(path, process.cwd());
var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var actual = path.resolve.bind(path, __dirname, 'actual');

function exists(name, re, cb) {
  if (typeof re === 'function') {
    cb = re;
    re = new RegExp(/./);
  }
  return function(err) {
    if (err) return cb(err);
    var filepath = actual(name);
    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      var str = fs.readFileSync(filepath, 'utf8');
      assert(re.test(str));
      cb();
    });
  };
}

describe('<%= ask("name") %>', function() {
  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('update', cb);
    });
  }

  beforeEach(function(cb) {
    app = update({silent: true});
    app.cwd = actual();
    app.disable('delete');
    app.option('srcBase', fixtures());
    app.option('dest', actual());
    del(actual(), function(err) {
      if (err) return cb(err);
      copy(fixtures('*'), actual(), {dot: true}, function(err) {
        if (err) return cb(err);
        process.chdir(actual());
        cb();
      });
    });
  });

  afterEach(function(cb) {
    process.chdir(cwd());
    del(actual(), cb);
  });

  describe('tasks', function() {
    beforeEach(function() {
      app.use(updater);
    });

    it('should run the `default` task with .build', function(cb) {
      app.build('default', exists('<%= ask("testFile") %>', cb));
    });

    it('should run the `default` task with .update', function(cb) {
      app.update('default', exists('<%= ask("testFile") %>', cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('updater (CLI)', function() {
      beforeEach(function() {
        app.use(updater);
      });

      it('should run the default task using the `<%= ask("name") %>` name', function(cb) {
        app.update('<%= ask("name") %>', exists('<%= ask("testFile") %>', cb));
      });

      it('should run the default task using the `updater` updater alias', function(cb) {
        app.update('<%= ask("alias") %>', exists('<%= ask("testFile") %>', cb));
      });
    });
  }

  describe('updater (API)', function() {
    it('should run the default task on the updater', function(cb) {
      app.register('<%= ask("alias") %>', updater);
      app.update('<%= ask("alias") %>', exists('<%= ask("testFile") %>', cb));
    });

    it('should run the `<%= ask("alias") %>` task', function(cb) {
      app.register('<%= ask("alias") %>', updater);
      app.update('<%= ask("alias") %>:<%= ask("alias") %>', exists('<%= ask("testFile") %>', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('<%= ask("alias") %>', updater);
      app.update('<%= ask("alias") %>:default', exists('<%= ask("testFile") %>', cb));
    });
  });

  describe('sub-updater', function() {
    it('should work as a sub-updater', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', updater);
      });
      app.update('foo.<%= ask("alias") %>', exists('<%= ask("testFile") %>', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', updater);
      });
      app.update('foo.<%= ask("alias") %>', exists('<%= ask("testFile") %>', cb));
    });

    it('should run the `<%= ask("alias") %>:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', updater);
      });
      app.update('foo.<%= ask("alias") %>:default', exists('<%= ask("testFile") %>', cb));
    });

    it('should run the `<%= ask("alias") %>:<%= ask("alias") %>` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', updater);
      });
      app.update('foo.<%= ask("alias") %>:<%= ask("alias") %>', exists('<%= ask("testFile") %>', cb));
    });

    it('should work with nested sub-updaters', function(cb) {
      app
        .register('foo', updater)
        .register('bar', updater)
        .register('baz', updater);
      app.update('foo.bar.baz', exists('<%= ask("testFile") %>', cb));
    });
  });
});
