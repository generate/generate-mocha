  it('should throw an error when invalid args are passed', function(cb) {
    try {
      <%= camelcase(project.alias) %>();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected first argument to be a string');
      assert.equal(err.message, 'expected callback to be a function');
      cb();
    }
  });