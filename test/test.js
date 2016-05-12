'use strict';

require('mocha');
var assert = require('assert');
var generate = require('generate');
var mocha = require('..');
var app;

describe('generate-mocha', function() {
  this.slow(500);

  beforeEach(function() {
    app = generate({silent: true});
  });

  describe('plugin', function() {
    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === 'generate-mocha') {
          count++;
        }
      });
      app.use(mocha);
      app.use(mocha);
      app.use(mocha);
      assert.equal(count, 1);
      cb();
    });
  });

  describe('generate-mocha', function() {
    it('should add a generator to the instance', function(cb) {
      app.use(mocha);
      assert.equal(typeof app.files, 'function');
      assert.equal(typeof app.includes, 'function');
      assert.equal(typeof app.layouts, 'function');
      cb();
    });

    it('should work as a generator', function() {
      app.option({
        create: {
          snippet: { viewType: 'partial' },
          section: { viewType: 'partial' },
          block: { viewType: 'layout' }
        }
      });

      app.generator('foo', function(foo) {
        foo.use(mocha);
        assert(foo.views.hasOwnProperty('snippets'));
        assert(foo.views.hasOwnProperty('sections'));
        assert(foo.views.hasOwnProperty('blocks'));
      });
    });
  });

  describe('generator', function() {
    it('should extend a generator', function(cb) {
      app.generator('foo', function(sub) {
        sub.use(mocha);
        assert(sub.views.hasOwnProperty('files'));
        assert(sub.views.hasOwnProperty('layouts'));
        assert(sub.views.hasOwnProperty('includes'));
        cb();
      });
    });

    it('should register as a sub-generator', function(cb) {
      app.generator('foo', function(sub) {
        sub.register('mocha', mocha);
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

  describe('collections', function() {
    it('should create custom template collections passed on **app** options', function() {
      app.option({
        create: {
          snippet: { viewType: 'partial' },
          section: { viewType: 'partial' },
          block: { viewType: 'layout' }
        }
      });

      app.generator('foo', function(sub) {
        sub.use(mocha);
        assert(sub.views.hasOwnProperty('snippets'));
        assert(sub.views.hasOwnProperty('sections'));
        assert(sub.views.hasOwnProperty('blocks'));
      });
    });

    it('should create custom template collections passed on **generator** options', function() {
      app.generator('foo', function(sub) {
        sub.option({
          create: {
            snippet: { viewType: 'partial' },
            section: { viewType: 'partial' },
            block: { viewType: 'layout' }
          }
        });
        sub.use(mocha);
        assert(sub.views.hasOwnProperty('snippets'));
        assert(sub.views.hasOwnProperty('sections'));
        assert(sub.views.hasOwnProperty('blocks'));
      });
    });
  });

  describe('templates', function() {
    it('should not change layouts defined on layouts', function(cb) {
      app.generator('foo', function(sub) {
        sub.extendWith(mocha);

        sub.task('render', function(next) {
          sub.layout('default', {content: 'one {% body %} two'});
          sub.layout('base', {content: 'three {% body %} four', layout: 'default'});
          sub.file('foo.md', {content: 'this is foo', layout: 'base'});

          sub.toStream('files')
            .pipe(sub.renderFile('*'))
            .pipe(sub.dest('test/actual'))
            .on('end', next);
        });

        sub.build('render', function(err) {
          if (err) return cb(err);
          assert.equal(sub.layouts.getView('base').layout, 'default');
          assert.equal(sub.files.getView('foo').layout, 'base');
          cb();
        });
      });
    });

    it('should set layout to `null` on partials with "default" defined', function(cb) {
      app.generator('foo', function(sub) {
        sub.extendWith(mocha);

        sub.task('render', function(next) {
          sub.layout('default', {content: '{% body %}'});
          sub.include('overview.md', {content: 'this is overview', layout: 'default'});
          sub.file('foo.md', {content: 'this is <%= include("overview.md") %>'});

          sub.toStream('files')
            .pipe(sub.renderFile('*'))
            .pipe(sub.dest('test/actual'))
            .on('end', next);
        });

        sub.build('render', function(err) {
          if (err) return cb(err);
          assert.equal(sub.files.getView('foo').layout, 'empty');
          assert.equal(sub.includes.getView('overview').layout, null);
          cb();
        });
      });
    });

    it('should set `partialLayout` on view.layout', function(cb) {
      app.generator('foo', function(sub) {
        sub.extendWith(mocha);

        sub.task('render', function(next) {
          sub.layout('default.md', {content: '{% body %}'});
          sub.layout('whatever.md', {content: '{% body %}'});
          sub.include('overview.md', {content: 'this is overview', partialLayout: 'whatever'});
          sub.file('foo.md', {content: 'this is <%= include("overview.md") %>'});

          sub.toStream('files')
            .pipe(sub.renderFile('*'))
            .pipe(sub.dest('test/actual'))
            .on('end', next);
        });

        sub.build('render', function(err) {
          if (err) return cb(err);
          assert.equal(sub.files.getView('foo').layout, 'empty');
          assert.equal(sub.includes.getView('overview').layout, 'whatever');
          cb();
        });
      });
    });

    it('should set layout to `empty` on renderable templates with no layout', function(cb) {
      app.generator('foo', function(sub) {
        sub.extendWith(mocha);

        sub.task('render', function(next) {
          sub.layout('default', {content: '{% body %}'});
          sub.file('foo.md', {content: 'this is foo'});

          sub.toStream('files')
            .pipe(sub.renderFile('*'))
            .pipe(sub.dest('test/actual'))
            .on('end', next);
        });

        sub.build('render', function(err) {
          if (err) return cb(err);

          assert.equal(sub.files.getView('foo').layout, 'empty');
          cb();
        });
      });
    });
  });

  describe('variables', function() {
    it('should expose `alias` to the context', function(done) {
      app.generator('sub', function(sub) {
        sub.extendWith(mocha);

        sub.task('render', function(cb) {
          var file = sub.file('sub.md', {content: 'foo <%= alias %> bar'});

          sub.toStream('files')
            .pipe(sub.renderFile('*'))
            .pipe(sub.dest('test/actual'))
            .on('end', function() {
              assert.equal(file.content, 'foo mocha bar');
              cb();
            });
        });

        sub.build('render', done);
      });
    });
  });
});
