  it('should return a stream', function() {
    var stream = normalize();
    assert(stream);
    assert.equal(typeof stream, 'object');
    assert.equal(typeof stream.pipe, 'function');
  });