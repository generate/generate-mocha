'use strict';

var path = require('path');
var debug = require('debug')('generate-mocha');
var beautify = require('gulp-js-beautify');
var rename = require('./lib/rename');
var utils = require('./lib/utils');
var src = path.resolve.bind(path, __dirname, 'templates');

module.exports = function(app, base, env, options) {
  if (!utils.isValid(app, 'generate-mocha')) return;
  debug('initializing from <%s>', __filename);

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

  app.helper('relative', function() {
    var dest = app.options.dest || app.cwd;
    var cwd = process.cwd();
    return dest !== cwd ? path.relative(dest, cwd) : './';
  });

  app.helper('camelcase', require('camel-case'));
  app.helper('helperName', function(name) {
    return name.replace(/^(handlebars-)?helper-/, '');
  });

  /**
   * Alias for the [test]() task. Allows the generator to be run with the following command:
   *
   * ```sh
   * $ gen mocha
   * ```
   * @name default
   * @api public
   */

  app.task('default', {silent: true}, ['mocha', 'prompt-install']);

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
   * Generate a `test.js` file with unit tests for a [gulp][] plugin project.
   *
   * ```sh
   * $ gen mocha:gulp
   * ```
   * @name gulp
   * @api public
   */

  task(app, 'gulp', 'scaffolds/plugin-gulp/test.js', ['templates']);

  /**
   * Generate a `test.js` file with unit tests for generic template helpers.
   *
   * ```sh
   * $ gen mocha:helper
   * ```
   * @name helper
   * @api public
   */

  task(app, 'helper', 'scaffolds/helpers/helper.js', ['templates']);

  /**
   * Generate a `test.js` file with unit tests for handlebars helpers.
   *
   * ```sh
   * $ gen mocha:hbs
   * $ gen mocha:handlebars
   * ```
   * @name handlebars
   * @api public
   */

  app.task('hbs', ['handlebars']);
  task(app, 'handlebars', 'scaffolds/helpers/handlebars.js', ['templates']);

  /**
   * Generate a `test.js` file for a regex project.
   *
   * ```sh
   * $ gen mocha:regex
   * ```
   * @name regex
   * @api public
   */

  task(app, 'regex', 'templates/regex.js', ['templates']);

  /**
   * Generate a `test.js` file for an [enquirer][] prompt module.
   *
   * ```sh
   * $ gen mocha:prompt
   * ```
   * @name prompt
   * @api public
   */

  task(app, 'prompt', 'templates/prompt.js', ['templates']);

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

  app.task('updater', ['updater-tests', 'install']);
  task(app, 'updater-tests', 'scaffolds/updater/templates/*.js');

  /**
   * Generate a `test.js` file in the cwd or specified directory. This task
   * is called by the default task. We alias the task as `mocha:mocha` to make
   * it easier for other generators to run it programmatically.
   *
   * ```sh
   * $ gen mocha:mocha
   * ```
   * @name mocha
   */

  app.task('mocha', [initPrompts, 'templates', 'data'], function(cb) {
    return app.src('templates/*.js', {cwd: __dirname})
      .pipe(filter(app.options.file || 'test.js'))
      .pipe(app.renderFile('*', {dest: app.cwd}))
      .pipe(beautify({ indent_size: 2 }))
      .pipe(app.conflicts(app.cwd))
      .pipe(app.dest(app.cwd));
  });

  /**
   * Pre-load templates. This is called by the [default](#default) task, but if you call
   * this task directly make sure it's called after collections are created.
   *
   * ```sh
   * $ gen mocha:templates
   * ```
   * @name templates
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
   * Merge prompt data from the base instance onto the generator's instance.
   *
   * ```sh
   * $ gen mocha:data
   * ```
   * @name data
   */

  app.task('data', function(cb) {
    app.data(app.base.cache.data);
    cb();
  });

  /**
   * Add custom prompts for this generator and set options to be used during prompts.
   */

  function initPrompts(cb) {
    app.question('testFile', 'Test fixture file name?', {default: 'example.txt'});
    app.option('askWhen', 'not-answered');
    cb();
  }

  /**
   * This task is used in unit tests to ensure this generator works in all intended
   * scenarios.
   *
   * ```sh
   * $ gen mocha:unit-test
   * ```
   * @name unit-test
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
  app.task(name, dependencies || [], function(cb) {
    app.src(pattern, {cwd: __dirname})
      .pipe(app.renderFile('*'))
      .pipe(utils.condense())
      .pipe(beautify({ indent_size: 2 }))
      .pipe(app.conflicts(app.cwd))
      .pipe(app.dest(app.cwd))
      .on('error', cb)
      .on('end', function() {
        app.build('prompt-install', cb);
      })
  });
}

/**
 * Filter files to be rendered
 */

function filter(name, options) {
  return utils.through.obj(function(file, enc, next) {
    if (file.isNull()) {
      next();
      return;
    }

    var basename = path.basename(file.history[0]);
    var stem = basename.slice(0, -3);

    if (basename === name || stem === name) {
      next(null, file);
    } else {
      next();
    }
  });
}
