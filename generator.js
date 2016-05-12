'use strict';

var path = require('path');
var opts = {alias: {tmpl: 't'}, default: {tmpl: 'test.js'}};
var argv = require('minimist')(process.argv.slice(2), opts);
var debug = require('debug')('generate:mocha');
var utils = require('./lib/utils');

module.exports = function(app, base) {
  if (app.isRegistered('generate-mocha')) return;
  debug('initializing <%s>, from <%s>', __filename, module.parent.id);

  var cwd = path.resolve.bind(path, __dirname);
  var rename = require('./lib/rename');
  var files = require('./lib/files');
  var utils = require('./lib/utils');

  /**
   * Register instance plugins
   */

  app
    .use(require('generate-defaults'))
    .use(require('generate-collections'))
    .use(utils.register())
    .use(rename())
    .use(prompt())
    .use(files());

  /**
   * Set options
   */

  app
    .option(base.options)
    .option(argv)
    .option({delims: ['<%', '%>']})
    .option('renameFile', function(file) {
      file.stem = 'test';
      return file;
    });

  function dir(name) {
    return app.option(name) || cwd(name);
  }

  /**
   * Register helpers
   */

  app.helper('camelcase', require('camel-case'));
  app.helper('relative', function(dest) {
    return (dest !== this.app.cwd) ? path.relative(dest, this.app.cwd) : './';
  });
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
   * Register pipeline plugins
   */

  app.plugin('rename', rename);

  /**
   * Register sub-generators
   */

  app.register('generators/*/', {cwd: __dirname});

  /**
   * This task is used in unit tests to ensure this generator works in all intended
   * scenarios.
   *
   * ```sh
   * $ gen mocha:unit-test
   * ```
   * @name unit-test
   * @api public
   */

  app.task('unit-test', function(cb) {
    app.base.set('cache.unit-test', true);
    cb();
  });

  /**
   * Pre-load templates. This is called by the [default](#default) task, but if you call
   * this task directly make sure it's called after collections are created.
   *
   * ```sh
   * $ gen mocha:templates
   * ```
   * @name templates
   * @api public
   */

  app.task('templates', { silent: true }, function(cb) {
    app.debug('loading templates');

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

    app.debug('loaded templates');
    cb();
  });

  /**
   * Loads the `project.name` and `project.alias` questions onto the `question.queue`
   * to be asked when the `.ask` method is called. This is called by the [default]() task.
   *
   * ```sh
   * $ gen mocha:questions
   * ```
   * @name questions
   * @api public
   */

  app.task('questions', { silent: true }, function(cb) {
    app.debug('loading questions');
    app.question('project.name', 'Project name?', {
      default: app.data('name') || app.pkg.get('name')
    });
    app.question('project.alias', 'Project alias?', {
      default: app.data('alias')
    });
    cb();
  });

  /**
   * Prompt the user for the `dest` directory to use for the generated test file(s).
   * Called by the [default]() task.
   *
   * ```sh
   * $ gen mocha:dest
   * ```
   * @name dest
   * @api public
   */

  app.task('dest', { silent: true }, function(cb) {
    app.question('dest', 'Destination directory?', {default: app.cwd});
    app.ask('dest', {save: false}, function(err, answers) {
      if (err) return cb(err);
      answers.dest = path.resolve(app.cwd, answers.dest);
      app.option('dest', answers.dest);
      cb();
    });
  });

  /**
   * Initiate a prompt session to ask the user which files to write to disk.
   *
   * ```sh
   * $ gen mocha:files
   * ```
   * @name files
   * @api public
   */

  app.task('choose', ['files']);
  app.task('files', ['templates', 'dest'], function(cb) {
    app.chooseFiles(app.options, cb);
  });

  /**
   * Generate a `test.js` file to the user's working directory.
   *
   * ```sh
   * $ gen mocha:test
   * ```
   * @name test
   * @api public
   */

  app.task('mocha', ['questions', 'templates', 'dest'], function(cb) {
    app.debug('generating default test.js file');
    var dest = app.option('dest') || app.cwd;
    var test = app.option('test') || 'test.js';

    // add `options` to the context
    app.data({ options: app.options });

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
      .on('end', function() {
        app.npm.askInstall('mocha', cb);
      });
  });

  /**
   * Generate a `test.js` file to the user's working directory. Alias for the [test]() task.
   *
   * ```sh
   * $ gen mocha
   * ```
   * @name default
   * @api public
   */

  app.task('default', { silent: true }, ['mocha']);
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
