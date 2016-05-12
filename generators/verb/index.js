'use strict';

module.exports = function(app, base, env) {
  app.register('generators/*/', {cwd: __dirname});

  app.task('indentity', function(cb) {
    console.log(app.name, '>', this.name);
    cb();
  });

  app.task('tree', function(cb) {
    console.log(app.tree());
    cb();
  });

  app.task('default', ['tree']);
};
