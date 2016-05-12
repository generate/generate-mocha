'use strict';

module.exports = function(app, base, env) {
  app.task('default', function(cb) {
    console.log(app.name, '>', this.name);
    cb();
  });

  app.task('foo', function(cb) {
    console.log(app.name, '>', this.name);
    cb();
  });
};
