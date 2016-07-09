---
install: ['base']
---
'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(alias) %> = require('<%= relative(dest) %>');
var Base = require('base');
var app;

describe('<%= ask("name") %>', function() {
  beforeEach(function() {
    app = new Base();
    app.use(<%= camelcase(alias) %>());
  });
  
  {% body %}
});
