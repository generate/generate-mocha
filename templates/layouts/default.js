'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(ask("alias")) %> = require('<%= relative(dest) %>');

describe('<%= ask("name") %>', function() {
  {% body %}
});
