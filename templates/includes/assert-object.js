  it('should export an object', function() {
    assert(<%= camelcase(alias) %>);
    assert.equal(typeof <%= camelcase(alias) %>, 'object');
  });
