'use strict';

require('mocha');
var assert = require('assert');
var <%= alias %> = require('./');
var Base = require('base');
var app;

describe('<%= name %>', function() {
  beforeEach(function() {
    app = new Base();
    app.use(<%= alias %>());
  });
  
  {% body %}
});
