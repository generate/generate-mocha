  it('should export a function', function() {
    assert.equal(typeof <%= camelcase(project.alias) %>, 'function');
  });
