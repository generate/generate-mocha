'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(ask("project.alias")) %> = require('<%= relative(dest) %>');

describe('<%= ask("project.name") %>', function() {
  {% body %}
});
