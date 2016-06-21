---
install: ['base']
---
'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(project.alias) %> = require('<%= relative(dest) %>');
var Base = require('base');
var app;

describe('<%= ask("project.name") %>', function() {
  beforeEach(function() {
    app = new Base();
    app.use(<%= camelcase(project.alias) %>());
  });
  
  {% body %}
});
