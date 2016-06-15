'use strict';

var util = require('util');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('base-fs-conflicts', 'conflicts');
require('base-register', 'register');
require('data-store', 'DataStore');
require('is-valid-app', 'isValid');
require('kind-of', 'typeOf');
require('log-utils', 'log');
require('match-file', 'match');
require('mixin-deep', 'merge');
require('through2', 'through');
require = fn;

utils.colors = utils.log.colors;

/**
 * Expose `utils` modules
 */

module.exports = utils;
