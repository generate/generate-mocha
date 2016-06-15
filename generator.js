'use strict';

var path = require('path');
var debug = require('debug')('generate:mocha');
var opts = {alias: {tmpl: 't'}, default: {tmpl: 'test.js'}};
var argv = require('minimist')(process.argv.slice(2), opts);
var debug = require('debug')('generate:mocha');
var rename = require('./lib/rename');
var utils = require('./lib/utils');

module.exports = function(app, base, env, options) {
  if (!utils.isValid(app, 'generate-mocha')) return;

  /**
   * Config store for user-defined, generator-specific defaults
   */

  var store = new utils.DataStore('generate-mocha');

  /**
   * Paths
   */

  var cwd = path.resolve.bind(path, __dirname);
  function dir(name) {
    return app.option(name) || cwd(name);
  }

  /**
   * Instance plugins
   */

  app.use(require('generate-defaults'))
    .use(require('generate-collections'))
    .use(utils.commonQuestions())
    .use(utils.register())
    .use(rename())
    .use(prompt())

  /**
   * Options
   */

  app.option(base.options)
    .option(argv)
    .option({delims: ['<%', '%>']})
    .option('renameFile', function(file) {
      file.stem = 'test';
      return file;
    });

  /**
   * Helpers
   */

  app.helper('camelcase', require('camel-case'));
  app.helper('strip', function(name, str) {
    return str.replace('^' + new RegExp(str) + '\\W*', '');
  });

  /**
   * Middleware
   */

  app.postRender(/\.js$/, function(view, next) {
    app.union('cache.install', view.data.install);
    next();
  });

  /**
   * Pipeline plugins
   */

  app.plugin('rename', rename);

  /**
   * Sub-generators
   */

  app.register('generators/*/', {cwd: __dirname});

  /**
   * Alias for the [test]() task. Allows the generator to be run with the following command:
   *
   * ```sh
   * $ gen mocha
   * ```
   * @name mocha:default
   * @api public
   */

  app.task('default', {silent: true}, ['mocha', 'post-generate']);

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

  app.task('templates', {silent: true}, function(cb) {
    debug('loading templates');

    app.includes.option('renameKey', function(key, file) {
      return file ? file.stem : path.basename(key, path.extname(key));
    });

    app.includes('*.js', {cwd: dir('templates/includes')});
    app.layouts('*.js', {cwd: dir('templates/layouts')});
    app.templates('*.js', {
      cwd: dir('templates'),
      renameKey: function(key, file) {
        return file ? file.basename : path.basename(key);
      }
    });

    debug('loaded templates');
    cb();
  });

  /**
   * Prompt the user to save preferences and automatically use them on the next run.
   *
   * ```sh
   * $ gen mocha:prompt-preferences
   * ```
   * @name mocha:prompt-preferences
   * @api public
   */

  app.task('prompt-preferences', {silent: true}, function(cb) {
    app.confirm('preferences', 'Want to automatically install mocha next time?');
    app.ask('preferences', {save: false}, function(err, answers) {
      if (err) return cb(err);
      if (answers.preferences) {
        store.set('install', true);
      }
      cb();
    });
  });

  /**
   * Prompt the user to install any necessary dependencies after generated files
   * are written to the file system.
   *
   * ```sh
   * $ gen mocha:prompt-install
   * ```
   * @name mocha:prompt-install
   * @api public
   */

  app.task('prompt-install', {silent: true}, function(cb) {
    app.npm.askInstall('mocha', function(err) {
      if (err) return cb(err);
      app.build('prompt-choices', cb);
    });
  });

  /**
   * Install any dependencies listed on `app.cache.install`.
   *
   * ```sh
   * $ gen mocha:install
   * ```
   * @name mocha:install
   * @api public
   */

  app.task('install', {silent: true}, function(cb) {
    app.npm.latest(app.get('cache.install') || 'mocha', cb);
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
    var choices = store.get('choices') || options.choices;

    // user wants to skip prompts
    if (choices === true) {
      app.build(['install'], cb);

    // user wants to be prompted (don't ask about choices again)
    } else if (choices === false) {
      app.build(['prompt-install'], cb);

    // user hasn't been asked yet
    } else {
      app.build(['prompt-install', 'prompt-choices'], cb);
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

  app.task('mocha', ['questions', 'templates'], function(cb) {
    debug('generating default test.js file');
    var dest = app.option('dest') || app.cwd;
    var test = app.option('test') || 'test.js';

    // add `options` to the context
    app.data({ options: app.options });

    app.toStream('templates')
      .pipe(filter(test))
      .pipe(app.renderFile('*', {project: {}}))
      .pipe(app.renameFile(function(file) {
        file.stem = 'test';
        return file;
      }))
      .pipe(app.conflicts(dest))
      .pipe(app.dest(dest))
      .on('error', cb)
      .on('end', cb);
  });

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
