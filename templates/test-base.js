---
layout: base
---

  describe('plugin', function() {
    <%= include("assert-function.js") %>
    <%= include("assert-object.js") %>
    <%= include("assert-method.js") %>
    <%= include("assert-error.js") %>
  });

  describe('.<%= camelcase(alias) %>', function() {
    it('should create an <%= rename(name, varname) %> pattern', function() {
      assert.equal(app.<%= camelcase(alias) %>('foo'), 'foo');
    });
  });
