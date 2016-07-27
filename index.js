'use strict';

var path = require('path');
var src = path.resolve.bind(path, __dirname, 'templates');
var condense = require('gulp-condense');
var rename = require('./lib/rename');
var utils = require('./lib/utils');

module.exports = function(app, base, env, options) {
  if (!utils.isValid(app, 'generate-mocha')) return;

  /**
   * Config store for user-defined preferences
   */

  var store = new utils.DataStore('generate-mocha');

  /**
   * Plugins
   */

  app.use(require('generate-defaults'));
  app.use(require('generate-collections'));
  app.use(require('generate-install'));
  app.use(rename());
  app.use(prompt());

  /**
   * Pipeline plugins
   */

  app.plugin('rename', rename);

  /**
   * Options
   */

  app.option(base.options)
    .option({delims: ['<%', '%>']})
    .option('renameFile', function(file) {
      file.stem = 'test';
      return file;
    });

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
   * Prompt the user to save preferences and automatically use them on the next run.
   *
   * ```sh
   * $ gen mocha:prompt-choices
   * ```
   * @name mocha:prompt-choices
   * @api public
   */

  app.task('choose', {silent: true}, ['prompt-choices']);
  app.task('prompt-choices', {silent: true}, function(cb) {
    app.confirm('choices', 'Want to automatically install mocha next time?');
    app.ask('choices', {save: false}, function(err, answers) {
      if (err) return cb(err);
      if (answers.choices) {
        store.set('install', true);
      }
      cb();
    });
  });

  /**
   * Asks if you want to use the same "post-generate" choices next time this generator
   * is run. If you change your mind, just run `gen node:choices` and you'll be prompted
   * again.
   *
   * If `false`, the [prompt-mocha](), [prompt-npm](), and [prompt-git]() tasks will be
   * run after files are generated then next time the generator is run.
   *
   * If `true`, the [mocha](), [npm](), and [git]() tasks will be run (and you will not
   * be prompted) after files are generated then next time the generator is run.
   *
   * ```sh
   * $ gen mocha:post-generate
   * ```
   * @name mocha:post-generate
   * @api public
   */

  app.task('post-generate', {silent: true}, function(cb) {
    var install = store.get('install') || options.install;

    // user wants to skip prompts
    if (install === true) {
      app.generate(['install'], cb);

    // user wants to be prompted (don't ask about installation again)
    } else if (install === false) {
      app.generate(['prompt-install'], cb);

    // user hasn't been asked yet
    } else {
      app.generate(['prompt-install', 'prompt-choices'], cb);
    }
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
      .pipe(app.renameFile(function(file) {
        file.stem = 'test';
        return file;
      }))
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
      .pipe(condense())
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

function prompt(options) {
  return function(app) {
    this.define('prompt', function(names) {
      return utils.through.obj(function(file, enc, next) {
        app.ask(names, {save: false}, function(err, answers) {
          if (err) {
            next(err);
            return;
          }
          app.data(answers);
          next(null, file);
        });
      });
    });
  };
}
