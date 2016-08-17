---
install:
  devDependencies: ['mocha', 'vinyl']
---
'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var File = require('vinyl');
var assert = require('assert');
var <%= camelcase(ask("name")) %> = require('<%= relative(dest) %>');

describe('<%= ask("name") %>', function () {
  it('should add an <%= camelcase(ask("name")) %> method', function (cb) {
    var stream = <%= camelcase(ask("name")) %>();
    var buffer = [];

    stream.write(new File({
      base: __dirname,
      path: __dirname + '/foo.txt'
    }));

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert(buffer[0].hasOwnProperty('<%= camelcase(ask("name")) %>'));
      assert.equal(typeof buffer[0].<%= camelcase(ask("name")) %>, 'function');
      cb();
    });

    stream.end();
  });

  it('should return true when a file is a binary file', function (cb) {
    var stream = <%= camelcase(ask("name")) %>();
    var buffer = [];

    var base = path.join.bind(path, __dirname, 'fixtures');
    var file = new File({
      base: base(),
      path: base('trunks.gif')
    });

    file.contents = fs.readFileSync(file.path);
    stream.write(file);

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer[0].basename, 'trunks.gif');
      assert(buffer[0].<%= camelcase(ask("name")) %>());
      cb();
    });
    stream.end();
  });

  it('should return false when a file is not a binary file', function (cb) {
    var stream = <%= camelcase(ask("name")) %>();
    var buffer = [];

    var file = new File({
      base: __dirname,
      path: path.join(__dirname, 'foo.txt')
    });

    file.contents = new Buffer('foo');
    stream.write(file);

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer[0].basename, 'foo.txt');
      assert(!buffer[0].<%= camelcase(ask("name")) %>());
      cb();
    });
    stream.end();
  });
});
