it('should throw an error when callback is not passed', function(cb) {
  assert.throws(function() {
    <%= camelcase(alias) %>();
  });
});
