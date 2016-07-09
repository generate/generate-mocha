---
layout: base
install: ['base', 'vinyl', 'mocha']
rename: 
  basename: 'test.js'
---

  describe('plugin', function() {
    <%= indent(include("assert-function.js")) %>
    <%= indent(include("assert-object.js")) %>
    <%= indent(include("assert-method.js")) %>
    <%= indent(include("assert-error.js")) %>
  });

  describe('.<%= camelcase(ask("alias")) %>', function() {
    it('should create an <%= camelcase(ask("alias")) %> pattern', function() {
      assert.equal(app.<%= camelcase(ask("alias")) %>('foo'), 'foo');
    });
  });