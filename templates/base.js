---
layout: base
install: ['base', 'vinyl', 'mocha']
rename:
  basename: 'test.js'
---

  describe('plugin', function() {
    <%= include("assert-function.js") %>
    <%= include("assert-object.js") %>
    <%= include("assert-method.js") %>
    <%= include("assert-error.js") %>
  });

  describe('.<%= camelcase(ask("alias")) %>', function() {
    it('should create an <%= camelcase(ask("alias")) %> pattern', function() {
      assert.equal(app.<%= camelcase(ask("alias")) %>('foo'), 'foo');
    });
  });
