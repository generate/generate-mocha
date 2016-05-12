  it('should export an object', function() {
    assert(<%= camelcase(project.alias) %>);
    assert.equal(typeof <%= camelcase(project.alias) %>, 'object');
  });
