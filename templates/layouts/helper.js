---
install: ['base']
---
'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(alias) %> = require('<%= relative(options.dest) %>');
var Base = require('base');
var app;

describe('<%= name %>', function() {
  beforeEach(function() {
    app = new Base();
    app.use(<%= camelcase(alias) %>());
  });
  
  {% body %}
});
