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
    .use(require('generate-install'))
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
  app.helper('relative', function(dest) {
    if (!dest) return '';
    return (dest !== app.cwd) ? path.relative(dest, app.cwd) : './';
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

  app.task('templates', {silent: false}, function(cb) {
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
   * $ gen mocha:prompt-choices
   * ```
   * @name mocha:prompt-choices
   * @api public
   */

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
    app.union('cache.install.devDependencies', ['mocha']);

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

  app.task('mocha', ['templates'], function(cb) {
    debug('generating default test.js file');
    var dest = app.option('dest') || app.cwd;
    var test = app.option('test') || 'test.js';

    app.option('askWhen', 'not-answered');
    if (app.options.alias) {
      app.data('project.alias', app.options.alias);
    }

    // add `dest` to the context
    app.data({ dest: dest });
    app.cache.data.project = app.cache.data.project || {};

    app.toStream('templates')
      .pipe(filter(test))
      .pipe(app.renderFile('*'))
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
