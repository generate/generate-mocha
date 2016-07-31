'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var bddStdin = require('bdd-stdin');
var npm = require('npm-install-global');
var del = require('delete');
var generator = require('..');
var pkg = require('../package');
var app;

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
      del(actual(), cb);
    });
  };
}

describe('generate-mocha', function() {
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

    it('should add tasks to the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('generator'));
      assert(app.tasks.hasOwnProperty('updater'));
      assert(app.tasks.hasOwnProperty('mocha'));
      assert(app.tasks.hasOwnProperty('base'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.build('default', exists('test.js', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.generate('default', exists('test.js', cb));
    });
  });

  describe('generator', function() {
    it('should extend a generator', function(cb) {
      app.generator('foo', function(sub) {
        sub.use(generator);
        assert(sub.tasks.hasOwnProperty('default'));
        assert(sub.tasks.hasOwnProperty('generator'));
        assert(sub.tasks.hasOwnProperty('updater'));
        assert(sub.tasks.hasOwnProperty('mocha'));
        assert(sub.tasks.hasOwnProperty('base'));
        cb();
      });
    });

    it('should register as a sub-generator', function(cb) {
      app.generator('foo', function(sub) {
        sub.register('mocha', generator);
        assert(sub.generators.hasOwnProperty('mocha'));
        cb();
      });
    });

    it('should run tasks as a sub-generator', function(cb) {
      app = generate({silent: true, cli: true});

      app.generator('foo', function(sub) {
        sub.register('mocha', require('..'));
        sub.generate('mocha:unit-test', function(err) {
          if (err) return cb(err);
          assert.equal(app.base.get('cache.unit-test'), true);
          cb();
        });
      });
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('generator (CLI)', function() {
      beforeEach(function() {
        bddStdin('\n');
        app.use(generator);
      });

      it('should run the default task using the `generate-mocha` name', function(cb) {
        app.generate('generate-mocha', exists('test.js', cb));
      });

      it('should run the default task using the `generator` generator alias', function(cb) {
        app.generate('mocha', exists('test.js', cb));
      });
    });
  }

  describe('generator (API)', function() {
    beforeEach(function() {
      bddStdin('\n');
    });

    it('should run the default task on the generator', function(cb) {
      app.register('mocha', generator);
      app.generate('mocha', exists('test.js', cb));
    });

    it('should run the `mocha` task', function(cb) {
      app.register('mocha', generator);
      app.generate('mocha:mocha', exists('test.js', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('mocha', generator);
      app.generate('mocha:default', exists('test.js', cb));
    });
  });

  describe('sub-generator', function() {
    beforeEach(function() {
      bddStdin('\n');
    });

    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('mocha', generator);
      });
      app.generate('foo.mocha', exists('test.js', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('mocha', generator);
      });
      app.generate('foo.mocha', exists('test.js', cb));
    });

    it('should run the `mocha:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('mocha', generator);
      });
      app.generate('foo.mocha:default', exists('test.js', cb));
    });

    it('should run the `mocha:mocha` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('mocha', generator);
      });
      app.generate('foo.mocha:mocha', exists('test.js', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator);
      app.generate('foo.bar.baz', exists('test.js', cb));
    });
  });
});
