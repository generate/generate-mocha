it('should throw an error when invalid args are passed', function() {
  assert.throws(function() {
    <%= camelcase(alias) %>();
  });
});
