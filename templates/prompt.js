---
install:
  devDependencies: ['mocha']
rename:
  basename: 'test.js'
---
'use strict';

require('mocha');
var assert = require('assert');
var answer = require('prompt-answer');
var Prompt = require('./');

describe('<%= name %>', function() {
  it('should export a function', function() {
    assert.equal(typeof Prompt, 'function');
  });

  it('should intantiate', function() {
    var prompt = new Prompt({name: 'foo'});
    assert(prompt instanceof Prompt);
  });

  it('should intantiate without new', function() {
    var prompt = Prompt({name: 'foo'});
    assert(prompt instanceof Prompt);
  });

  it('should throw an error when invalid args are passed', function() {
    assert.throws(function() {
      Prompt();
    }, /expected question to be a string or object/);

    assert.throws(function() {
      new Prompt();
    }, /expected question to be a string or object/);
  });

  it('should accept a number keypress on run', function(cb) {
    var prompt = new Prompt({
      name: 'color',
      message: 'What colors do you like?',
      choices: ['red', 'green', 'blue']
    });

    answer(prompt, 2);

    prompt.run()
      .then(function(answer) {
        assert.deepEqual(answer, ['green']);
        cb();
      })
  });

  it('should accept an array of number keypresses on run', function(cb) {
    var prompt = new Prompt({
      name: 'color',
      message: 'What colors do you like?',
      choices: ['red', 'green', 'blue']
    });

    answer(prompt, [1, 2]);

    prompt.run()
      .then(function(answer) {
        assert.deepEqual(answer, ['red', 'green']);
        cb();
      })
  });

  it('should accept a number keypress on ask', function(cb) {
    var prompt = new Prompt({
      name: 'color',
      message: 'What colors do you like?',
      choices: ['red', 'green', 'blue']
    });

    answer(prompt, 2);

    prompt.ask(function(answer) {
      assert.deepEqual(answer, ['green']);
      cb();
    });
  });

  it('should accept an array of number keypresses on ask', function(cb) {
    var prompt = new Prompt({
      name: 'color',
      message: 'What colors do you like?',
      choices: ['red', 'green', 'blue']
    });

    answer(prompt, [1, 2]);

    prompt.ask(function(answer) {
      assert.deepEqual(answer, ['red', 'green']);
      cb();
    });
  });

  it('should return an answers object on run', function(cb) {
    var prompt = new Prompt({
      name: 'color',
      message: 'What is your favorite color?'
    });

    answer(prompt, 'blue');

    prompt.run()
      .then(function(answer) {
        assert.deepEqual(answer, 'blue');
        cb();
      })
  });

  it('should return an answers object on ask', function(cb) {
    var prompt = new Prompt({
      name: 'color',
      message: 'What is your favorite color?'
    });

    answer(prompt, 'green');

    prompt.ask(function(answer) {
      assert.deepEqual(answer, 'green');
      cb();
    });
  });
});

