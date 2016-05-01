'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(alias) %> = require('<%= relative(options.dest) %>');

describe('<%= name %>', function() {
  {% body %}
});
