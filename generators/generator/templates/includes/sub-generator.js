it('should run tasks as a sub-generator', function(cb) {
  app = generate({silent: true, cli: true});

  app.generator('foo', function(sub) {
    sub.register('<%= alias %>', require('..'));
    sub.generate('<%= alias %>:unit-test', function(err) {
      if (err) return cb(err);
      assert.equal(app.base.get('cache.unit-test'), true);
      cb();
    });
  });
});