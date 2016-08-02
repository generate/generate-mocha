it('should throw an error when callback is not passed', function(cb) {
  try {
    <%= alias %>();
    cb(new Error('expected an error'));
  } catch (err) {
    assert(err);
    assert.equal(err.message, 'expected callback to be a function');
    cb();
  }
});
