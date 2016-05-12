'use strict';

module.exports = function(app, base, env) {
  app.task('default', function(cb) {
    console.log(app.name, '>', this.name);
    cb();
  });

  app.task('template', function(cb) {
    console.log(app.name, '>', this.name);
    cb();
  });

  app.task('plugin', function(cb) {
    console.log(app.name, '>', this.name);
    cb();
  });
};
