'use strict';

var debug = require('debug')('generate-mocha:rename-file');
var path = require('path');
var utils = require('./utils');

/**
 * Some of this code is based on gulp-rename. we're trying
 * to make this easier to use when options can't be passed
 * directly to a gulp plugin
 */

module.exports = function(config) {
  return function plugin(app) {
    debug('initializing');
    if (!utils.isValid(app, 'generate-mocha-rename-file')) return;
    this.define('renameFile', function(val) {
      return utils.through.obj(function(file, enc, cb) {
        var orig = file.path;
        var options = utils.merge({}, config, app.options);
        var filepath, opts;

        if (options === '') {
          cb(null, file);
          return;
        }

        switch (utils.typeOf(val)) {
          case 'string':
            filepath = val;
            break;
          case 'function':
            var res = val(file);
            if (res) file = res;

            opts = utils.merge({}, config, options, getPaths(file));
            var name = opts.filename || opts.stem;
            filepath = path.resolve(opts.dirname, name + opts.extname);
            break;
          case 'object':
            opts = utils.merge({filename: file.stem}, config, options, val);
            if ('stem' in opts) opts.filename = opts.stem;

            var dirname = 'dirname' in opts ? opts.dirname : file.dirname;
            var filename = 'filename' in opts ? opts.filename : file.stem;
            var extname = 'extname' in opts ? opts.extname : file.extname;

            var prefix = val.prefix || '';
            var suffix = val.suffix || '';

            filepath = path.resolve(dirname, prefix + filename + suffix + extname);
            break;
          default:
            cb(new Error('expected an object, string, or function'));
            return;
        }

        file.path = path.resolve(file.base, filepath);

        // Rename sourcemap if present
        if (file.sourceMap) {
          file.sourceMap.file = file.relative;
        }

        debug('renamed <%s> to <%s>', orig, file.path);
        cb(null, file);
      });
    });

    return plugin;
  };
};

function getPaths(file) {
  return {
    dirname: file.dirname,
    basename: file.basename,
    filename: file.filename || file.stem,
    stem: file.filename || file.stem,
    extname: file.ext || file.extname,
    ext: file.ext || file.extname
  };
}
