'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(project.alias) %> = require('<%= relative(options.dest) %>');

describe('<%= ask("project.name") %>', function() {
  {% body %}
});
