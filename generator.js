'use strict';

var path = require('path');
var src = path.resolve.bind(path, __dirname, 'templates');
var rename = require('./lib/rename');
var utils = require('./lib/utils');

module.exports = function(app, base, env, options) {
  if (!utils.isValid(app, 'generate-mocha')) return;

  /**
   * Middleware
   */

  app.onLoad(/example/, function(file, next) {
    console.log('onLoad:', file.path)
    next();
  });

  app.preWrite(/example/, function(file, next) {
    console.log('preWrite:', file.path)
    if (file.stem === 'example' && app.cache.data.filename) {
      file.basename = app.cache.data.filename;
    }
    next();
  });

  /**
   * Plugins
   */

  app.use(require('generate-collections'));
  app.use(require('generate-defaults'));
  app.use(require('generate-install'));

  /**
   * Options
   */

  app.option(base.options);
  app.option({delims: ['<%', '%>']});

  /**
   * Helpers
   */

  app.helper('indent', function(str) {
    return str.split('\n').join('\n  ');
  });

  app.helper('relative', function(dest) {
    var cwd = app.options.dest || app.cwd;
    if (!utils.isString(dest)) {
      dest = this.view.dirname;
    }
    if (utils.isString(dest) && dest !== cwd) {
      return path.relative(dest, cwd);
    }
    return './';
  });

  /**
   * Generate unit tests for a [generate][] generator. Creates:
   *
   *  - `test.js`
   *  - `plugin.js`
   *
   * ```sh
   * $ gen mocha:gen
   * # aliased as
   * $ gen mocha:generator
   * ```
   * @name generator
   * @api public
   */

  app.task('gen', ['generator']);
  task(app, 'generator', 'scaffolds/generator/templates/*.js');

  /**
   * Generate unit tests for an [update][] "updater". Creates:
   *
   *  - `test.js`
   *  - `plugin.js`
   *
   * ```sh
   * $ gen mocha:updater
   * ```
   * @name updater
   * @api public
   */

  task(app, 'updater-tests', 'scaffolds/updater/templates/*.js');
  app.task('updater', ['updater-tests', 'install']);

  /**
   * Generate a `test.js` file with unit tests for a [base][] project.
   *
   * ```sh
   * $ gen mocha:base
   * ```
   * @name base
   * @api public
   */

  task(app, 'base', 'templates/base.js', ['templates']);

  /**
   * Pre-load templates. This is called by the [default](#default) task, but if you call
   * this task directly make sure it's called after collections are created.
   *
   * ```sh
   * $ gen mocha:templates
   * ```
   * @name mocha:templates
   * @api public
   */

  app.task('templates', {silent: false}, function(cb) {
    app.includes.option('renameKey', function(key, file) {
      return file ? file.basename : path.basename(key);
    });
    app.includes('*.js', {cwd: src('includes')});
    app.layouts('*.js', {cwd: src('layouts')});
    cb();
  });

  /**
   * Generate a `test.js` file in the cwd or specified directory. This task
   * is called by the default task. We alias the task as `mocha:mocha` to make
   * it easier for other generators to run it programmatically.
   *
   * ```sh
   * $ gen mocha:mocha
   * ```
   * @name mocha:mocha
   * @api public
   */

  app.question('testFile', 'Test fixture file name?', {default: 'example.txt'});
  app.task('mocha', ['templates'], function() {
    var name = app.options.file || 'test.js';
    app.option('askWhen', 'not-answered');
    return app.src('templates/*.js', {cwd: __dirname})
      .pipe(filter(name))
      .pipe(app.renderFile('*', {dest: app.cwd}))
      .pipe(app.conflicts(app.cwd))
      .pipe(app.dest(app.cwd));
  });

  /**
   * Alias for the [test]() task. Allows the generator to be run with the following command:
   *
   * ```sh
   * $ gen mocha
   * ```
   * @name mocha:default
   * @api public
   */

  app.task('default', {silent: true}, ['mocha']);

  /**
   * This task is used in unit tests to ensure this generator works in all intended
   * scenarios.
   *
   * ```sh
   * $ gen mocha:unit-test
   * ```
   * @name mocha:unit-test
   * @api public
   */

  app.task('unit-test', function(cb) {
    app.base.set('cache.unit-test', true);
    cb();
  });
};

/**
 * Create a task with the given `name` and glob `pattern`
 */

function task(app, name, pattern, dependencies) {
  app.task(name, dependencies || [], function() {
    return app.src(pattern, {cwd: __dirname})
      .pipe(app.renderFile('*'))
      .pipe(utils.condense())
      .pipe(app.conflicts(app.cwd))
      .pipe(app.dest(app.cwd));
  });
}

/**
 * Filter files to be rendered
 */

function filter(pattern, options) {
  var isMatch = utils.match.matcher(pattern, options);
  return utils.through.obj(function(file, enc, next) {
    if (file.isNull()) {
      next();
      return;
    }
    if (isMatch(file)) {
      next(null, file);
    } else {
      next();
    }
  });
}
