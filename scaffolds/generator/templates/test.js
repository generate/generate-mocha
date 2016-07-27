---
install:
  devDependencies: ['generate', 'npm-install-global', 'delete', 'global-modules']
rename:
  dirname: 'test'
  basename: 'test.js'
---
'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var bddStdin = require('bdd-stdin');
var npm = require('npm-install-global');
var gm = require('global-modules');
var del = require('delete');
var generator = require('<%= relative(dest) %>');
var pkg = require('../package');
var app;

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var actual = path.resolve.bind(path, __dirname, 'actual');

function exists(name, re, cb) {
  if (typeof re === 'function') {
    cb = re;
    re = new RegExp(pkg.name);
  }

  return function(err) {
    if (err) return cb(err);
    var filepath = actual(name);
    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      var str = fs.readFileSync(filepath, 'utf8');
      assert(re.test(str));
      del(actual(), cb);
    });
  };
}

function symlink(dir, cb) {
  var src = path.resolve(dir);
  var name = path.basename(src);
  var dest = path.resolve(gm, name);
  fs.stat(dest, function(err, stat) {
    if (err) {
      fs.symlink(src, dest, cb);
    } else {
      cb();
    }
  });
}

describe('<%= ask("name") %>', function() {
  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  before(function(cb) {
    del(actual(), cb);
  });

  beforeEach(function() {
    app = generate({silent: true});
    app.cwd = actual();
    app.option('dest', actual());
  });

  afterEach(function(cb) {
    del(actual(), cb);
  });

  describe('tasks', function() {
    beforeEach(function() {
      app.use(generator);
    });

    it('should run the `default` task with .build', function(cb) {
      app.build('default', exists('example.txt', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.generate('default', exists('example.txt', cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('generator (CLI)', function() {
      before(function(cb) {
        symlink(__dirname, cb);
      });

      beforeEach(function() {
        bddStdin('\n');
        app.use(generator);
      });

      it('should run the default task using the `<%= ask("name") %>` name', function(cb) {
        app.generate('<%= ask("name") %>', exists('example.txt', cb));
      });

      it('should run the default task using the `generator` generator alias', function(cb) {
        app.generate('<%= ask("alias") %>', exists('example.txt', cb));
      });
    });
  }

  describe('generator (API)', function() {
    beforeEach(function() {
      bddStdin('\n');
    });

    it('should run the default task on the generator', function(cb) {
      app.register('<%= ask("alias") %>', generator);
      app.generate('<%= ask("alias") %>', exists('example.txt', cb));
    });

    it('should run the `<%= ask("alias") %>` task', function(cb) {
      app.register('<%= ask("alias") %>', generator);
      app.generate('<%= ask("alias") %>:<%= ask("alias") %>', exists('example.txt', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('<%= ask("alias") %>', generator);
      app.generate('<%= ask("alias") %>:default', exists('example.txt', cb));
    });
  });

  describe('sub-generator', function() {
    beforeEach(function() {
      bddStdin('\n');
    });

    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', generator);
      });
      app.generate('foo.<%= ask("alias") %>', exists('example.txt', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', generator);
      });
      app.generate('foo.<%= ask("alias") %>', exists('example.txt', cb));
    });

    it('should run the `<%= ask("alias") %>:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', generator);
      });
      app.generate('foo.<%= ask("alias") %>:default', exists('example.txt', cb));
    });

    it('should run the `<%= ask("alias") %>:<%= ask("alias") %>` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= ask("alias") %>', generator);
      });
      app.generate('foo.<%= ask("alias") %>:<%= ask("alias") %>', exists('example.txt', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator);
      app.generate('foo.bar.baz', exists('example.txt', cb));
    });
  });
});
