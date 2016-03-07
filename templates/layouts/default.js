'use strict';

require('mocha');
var assert = require('assert');
var <%= alias %> = require('./');

describe('<%= name %>', function() {
{% body %}
});
