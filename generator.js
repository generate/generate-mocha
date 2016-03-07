'use strict';

var path = require('path');
var match = require('match-file');
var extend = require('extend-shallow');
var conflicts = require('base-fs-conflicts');
var rename = require('./rename');
var files = require('./files');

/**
 * Extend your generator with the features and settings of this
 * generator using the `.extendWith` method.
 *
 * ```js
 * app.extendWith(require('generate-mocha'));
 * ```
 * @param {Object} `app` your generator instance
 * @api public
 */

module.exports = function(app, base) {
  app.debug('initializing generator');

  /**
   * Options (merge `base` instance options onto our
   * generator's options)
   */

  app.option({delims: ['<%', '%>']}, base.options);
  app.option('renameFile', function(file) {
    file.stem = 'test';
    return file;
  });

  var gwd = path.resolve.bind(path, __dirname);
  var opts = app.options;

  /**
   * Extend our generator with other generators
   */

  app.extendWith(require('generate-collections'));
  app.extendWith(require('generate-defaults'));

  /**
   * Load instance plugins
   */

  app.use(conflicts(opts));
  app.use(rename(opts));
  app.use(files(opts));

  /**
   * Register pipeline plugins
   */

  app.plugin('rename', rename);

  /**
   * Helpers
   */

  app.helper('relative', function(dest) {
    return path.relative(this.context.cwd, dest);
  });

  /**
   * Pre-load templates
   */

  app.task('templates', function (cb) {
    app.debug('loading templates');

    app.includes.option('renameKey', function(key, file) {
      return file ? file.stem : path.basename(key, path.extname(key));
    });

    app.includes('*.js', {cwd: gwd('templates/includes')});
    app.layouts('*.js', {cwd: gwd('templates/layouts')});
    app.templates('*.js', {
      cwd: gwd('templates'),
      renameKey: function (key, file) {
        return file ? file.basename : path.basename(key);
      }
    });

    app.debug('loaded templates');
    cb();
  });

  /**
   * Run inherited tasks and pre-load tasks
   */

  app.task('setup', ['collections', 'defaults', 'templates']);

  /**
   * Prompt the user for the `dest` to use
   */

  app.task('dest', function(cb) {
    app.debug('prompting for destination directory');
    app.question('dest', 'Destination directory?', {default: '.'});
    app.ask('dest', {save: false}, function(err, answers) {
      if (err) return cb(err);
      app.option('dest', answers.dest);
      cb();
    });
  });

  /**
   * Initiate a prompt session that asks the user
   * which files to write to disk.
   */

  app.task('choose', ['setup', 'dest'], function(cb) {
    app.chooseFiles(opts, cb);
  });

  /**
   * Write a `test.js` file to the user's working directory
   */

  app.task('test', ['setup', 'dest'], function(cb) {
    app.debug('generating default test.js file');
    app.fillin('dest', app.cwd);

    app.toStream('templates', filter(opts))
      .pipe(app.renderFile('*', opts))
      .pipe(app.renameFile(function(file) {
        file.filename = 'test';
        return file;
      }))
      .pipe(app.conflicts(app.option('dest')))
      .pipe(app.dest(app.option('dest')))
      .on('error', cb)
      .on('end', cb);
  });

  /**
   * Default question
   */

  app.task('default', ['test']);
};

/**
 * Filter files to be rendered
 */

function filter(opts) {
  if (Array.isArray(opts.files)) {
    return opts.files;
  }

  var name = opts.t || opts.tmpl || 'test.js';
  return function(key, file) {
    if (name === 'base' && file.stem === 'test-base') {
      file.basename = 'test.js';
      return true;
    }
    return name === key || match(name, file);
  }
}
