'use strict';

var path = require('path');
var opts = {alias: {tmpl: 't'}, default: {tmpl: 'test.js'}};
var argv = require('minimist')(process.argv.slice(2), opts);
var debug = require('debug')('generate:mocha');
var utils = require('./lib/utils');

/**
 * Extend your generator with the features and settings of this
 * generator using the `.extendWith` method.
 *
 * ```js
 * app.extendWith(require('generate-mocha'));
 * ```
 * @param {Object} `app` generator instance
 */

module.exports = function(app, base) {
  if (this.isRegistered('generate-mocha')) return;
  debug('initializing <%s>, from <%s>', __filename, module.parent.id);

  var templates = path.resolve.bind(path, __dirname, 'templates');
  var rename = require('./lib/rename');
  var files = require('./lib/files');
  var utils = require('./lib/utils');

  /**
   * Register instance plugins
   */

  app
    .use(require('generate-defaults'))
    .use(require('generate-collections'))
    .use(utils.conflicts())
    .use(rename())
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

  /**
   * Register pipeline plugins
   */

  app.plugin('rename', rename);

  /**
   * Register helpers
   */

  app.helper('camelcase', require('camel-case'));
  app.helper('relative', function(dest) {
    dest = path.resolve(dest || this.options.dest || '.');
    return dest !== this.app.cwd ? path.relative(dest, this.app.cwd) : './';
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

  app.task('default', ['test']);

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

  app.task('templates', function(cb) {
    app.debug('loading templates');

    app.includes.option('renameKey', function(key, file) {
      return file ? file.stem : path.basename(key, path.extname(key));
    });

    app.includes('*.js', {cwd: templates('includes')});
    app.layouts('*.js', {cwd: templates('layouts')});
    app.templates('*.js', {
      cwd: templates(),
      renameKey: function(key, file) {
        return file ? file.basename : path.basename(key);
      }
    });

    app.debug('loaded templates');
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

  app.task('dest', function(cb) {
    app.question('dest', 'Destination directory?', {default: process.cwd()});
    app.ask('dest', {save: false}, function(err, answers) {
      if (err) return cb(err);
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

  app.task('test', ['templates', 'dest'], function(cb) {
    app.debug('generating default test.js file');
    var dest = app.option('dest') || app.cwd;
    var test = app.option('test') || 'test.js';

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
