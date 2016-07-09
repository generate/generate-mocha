---
install: ['base', 'vinyl']
---
'use strict';

require('mocha');
var assert = require('assert');
var <%= camelcase(ask("alias")) %> = require('<%= relative(dest) %>');
var Base = require('base');
var app;

describe('<%= name %>', function() {
  beforeEach(function() {
    app = new Base();
    app.use(<%= camelcase(ask("alias")) %>());
  });
  
  {% body %}
});
