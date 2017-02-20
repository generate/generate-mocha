---
install:
  devDependencies: ['mocha']
rename:
  basename: 'test.js'
---
/*!
 * <%= name %> <https://github.com/regexps/<%= name %>>
 *
 * Copyright (c) <%= year %> <%= ask('author.name') %>.
 * Licensed under the <%= ask('license', {default: 'MIT'}) %> license.
 */

'use strict';

require('mocha');
var assert = require('assert');
var regex = require('<%= relative() %>');

function match(str) {
  return str.match(regex());
}

describe('<%= ask("name") %>', function() {
  it('should match the given string:', function () {
    assert(regex().test('foo'));
    assert(!regex().test('bar'));
  });

  it('should create match groups:', function () {
    assert.equal(match('foo.bar.baz')[0], 'foo');
    assert.equal(match('foo.bar.baz')[1], 'bar');
    assert.equal(match('foo.bar.baz')[2], 'baz');
  });

  it('should return null when no matches are found:', function () {
    assert.equal(match(''), null);
    assert.equal(match('abc'), null);
    assert.equal(match('a/b/c'), null);
  });
});
