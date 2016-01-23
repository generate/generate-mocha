'use strict';

var namify = require('namify');

module.exports = function(app, generate, env) {
  app.engine('text', require('engine-base'));

  app.task('default', function(cb) {
    app.toStream('templates', toFilename(env))
      .pipe(app.renderFile('text', data(env)))
      .pipe(app.dest(dest(env, app)))
      .on('end', function() {
        app.devDependencies(deps, cb);
      });
  });
};

function dest(env, app) {
  var destDir = env.dest || app.cwd;
  return function(file) {
    file.basename = 'test.js';
    return destDir;
  };
}

function data(env) {
  var opts = env.argv.raw;
  var obj = env.user.pkg;
  var name = env.user.pkg.name;
  obj.varname = opts.var || namify(name);
  return obj;
}

function filter(filename) {
  return function(key, file) {
    return file.basename === filename;
  };
}

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

function toFilename(argv) {
  var name = env.argv.raw.file || 'test.js';
  if (name === 'test') return name + '.js';
  name = name.replace(/^test-|\.js/g, '');
  return 'test-' + name + '.js';
}
