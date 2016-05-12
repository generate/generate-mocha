---
layout: base
install: ['base', 'vinyl']
---

  describe('plugin', function() {
    <%= include("assert-function.js") %>
    <%= include("assert-object.js") %>
    <%= include("assert-method.js") %>
    <%= include("assert-error.js") %>
  });

  describe('.<%= camelcase(project.alias) %>', function() {
    it('should create an <%= camelcase(project.alias) %> pattern', function() {
      assert.equal(app.<%= camelcase(project.alias) %>('foo'), 'foo');
    });
  });
