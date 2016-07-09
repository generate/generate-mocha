---
install: ['vinyl']
---
'use strict';

require('mocha');
var assert = require('assert');
var File = require('vinyl');
var <%= camelcase(alias) %> = require('<%= relative(dest) %>');

describe('<%= ask("name") %>', function() {  
  {% body %}
});
