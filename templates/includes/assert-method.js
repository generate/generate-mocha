  it('should expose a .<%= camelcase(alias) %> method', function() {
      assert.equal(typeof app.<%= camelcase(alias) %>, 'function');
    });
