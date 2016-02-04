'use strict';

var path = require('path');
var namify = require('namify');

module.exports = function(app, generate, env) {
  app.engine('text', require('engine-base'));

  app.task('default', function(cb) {
    app.toStream('templates', filter(env))
      .pipe(app.renderFile('text', data(env, app)))
      .pipe(app.dest(dest(env, app)))
      .on('end', function() {
        app.devDependencies(deps(env), cb);
      });
  });
};

function deps(env) {
  if (env.argv.raw.file === 'base') {
    return ['mocha', 'base'];
  }
  return ['mocha'];
}

function dest(env, app) {
  var destDir = env.dest || app.cwd;
  return function(file) {
    file.basename = 'test.js';
    return destDir;
  };
}

function relative(env, app) {
  var destDir = path.resolve(env.dest || app.cwd);
  var fp = path.relative(destDir, app.cwd);
  return fp || './';
}

function data(env, app) {
  var opts = env.argv.raw;
  var obj = env.user.pkg;
  var name = env.user.pkg.name;
  obj.varname = opts.var || namify(name);
  obj.relativeDir = relative(env, app);
  return obj;
}

function filter(env) {
  return function(key, file) {
    return file.basename === toFilename(env);
  };
}

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

function toFilename(env) {
  var name = env.argv.raw.file || 'test.js';
  name = name.replace(/^test-|\.js$/g, '');
  if (name === 'test') return name + '.js';
  return 'test-' + name + '.js';
}
