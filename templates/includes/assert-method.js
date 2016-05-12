  it('should expose a .<%= camelcase(project.alias) %> method', function() {
    assert.equal(typeof app.<%= camelcase(project.alias) %>, 'function');
  });
