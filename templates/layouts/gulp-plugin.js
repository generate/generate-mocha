---
install: ['vinyl']
---
'use strict';

require('mocha');
var assert = require('assert');
var File = require('vinyl');
var <%= camelcase(project.alias) %> = require('<%= relative(options.dest) %>');

describe('<%= ask("project.name") %>', function() {  
  {% body %}
});
