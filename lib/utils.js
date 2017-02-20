'use strict';

var util = require('util');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('gulp-condense', 'condense');
require('is-valid-app', 'isValid');
require('kind-of', 'typeOf');
require('mixin-deep', 'merge');
require('through2', 'through');
require = fn;

utils.isString = function(str) {
  return str && typeof str === 'string';
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
