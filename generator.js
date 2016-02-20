'use strict';

var path = require('path');
var match = require('match-file');
var conflicts = require('file-conflicts');
var extend = require('extend-shallow');

module.exports = function(app, base) {
  app.task('mocha', { silent: true }, task(app, base.options));
  app.task('default', ['mocha']);
};

function task(app, options) {
  return function(cb) {
    var opts = extend({}, app.options, options);

    // lazily invoke the generator
    mocha(app, opts);

    return app.toStream('templates', filter(opts))
      .pipe(app.renderFile('*', opts))
      .pipe(app.conflicts(app.cwd))
      .pipe(app.dest(app.cwd));
  };
}

function mocha(app, options) {
  app.extendWith(require('generate-defaults'));
  // load `base-conflicts` plugin
  app.use(conflicts());
  // load mocha test templates
  app.templates('templates/*', { cwd: __dirname });
  // custom helper for relative path
  app.helper('relative', function(dest) {
    return path.relative(this.context.cwd, dest);
  });
}

/**
 * Expose `invoke` to allow customizing when the generator is invoked
 */

module.exports.invoke = mocha;

/**
 * Expose `task` to allow customing how task is registered
 */

module.exports.task = task;

/**
 * Filter files to be rendered
 */

function filter(opts) {
  var name = opts.t || opts.tmpl || 'test.js';
  return function(key, file) {
    if (name === 'base' && file.stem === 'test-base') {
      file.basename = 'test.js';
      return true;
    }
    return name === key || match(name, file);
  }
}
