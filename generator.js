'use strict';

var path = require('path');
var debug = require('debug')('generate:mocha');
var argv = require('minimist')(process.argv.slice(2), {
  alias: {tmpl: 't'},
  default: {
    tmpl: 'test.js'
  }
});

/**
 * Extend your generator with the features and settings of this
 * generator using the `.extendWith` method.
 *
 * ```js
 * app.extendWith(require('generate-mocha'));
 * ```
 * @param {Object} `app` generator instance
 * @api public
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

  app.option(base.options);
  app.option(argv);
  app.option({delims: ['<%', '%>']});
  app.option('renameFile', function(file) {
    file.stem = 'test';
    return file;
  });

  /**
   * Pipeline plugins
   */

  app.plugin('rename', rename);

  /**
   * Helpers
   */

  // app.helpers(require('template-helpers'));
  app.helper('camelcase', require('camel-case'));
  app.helper('relative', function(dest) {
    dest = path.resolve(dest || this.options.dest || '.');
    return dest !== this.app.cwd ? path.relative(dest, this.app.cwd) : './';
  });

  /**
   * Pre-load templates (needs to be done after collections are created)
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
   * Prompt the user for the `dest` to use
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
   * Initiate a prompt session that asks the user
   * which files to write to disk.
   */

  app.task('choose', ['templates', 'dest'], function(cb) {
    app.chooseFiles(app.options, cb);
  });

  /**
   * Write a `test.js` file to the user's working directory
   */

  app.task('test', ['templates', 'dest'], function(cb) {
    app.debug('generating default test.js file');
    app.fillin('dest', app.cwd);

    app.toStream('templates', filter(app.options))
      .pipe(app.renderFile('*', app.options))
      .pipe(app.renameFile(function(file) {
        file.stem = 'test';
        return file;
      }))
      .pipe(app.conflicts(app.option('dest')))
      .pipe(app.dest(app.option('dest')))
      .on('error', cb)
      .on('end', function() {
        app.npm.askInstall('mocha', cb);
      });
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
  return function(key, file) {
    if (opts.tmpl === 'base' && file.stem === 'test-base') {
      file.basename = 'test.js';
      return true;
    }
    return opts.tmpl === key || utils.match(opts.tmpl, file);
  };
}
