'use strict';

var path = require('path');
var trees = require('verb-trees');
var del = require('delete');
var generator = require('./');

/**
 * HEADS UP! Verb takes ~2-3 sec. to run because the `trees` task
 * has to run all of the generator's tasks to create the trees.
 * In other words, it has to generate ~10 projects to get the trees.
 */

module.exports = function(app) {
  app.use(require('verb-generate-readme'));
  app.option('overwrite', function(file) {
    return file.basename === 'test.js';
  });

  app.use(trees(generator, [
    'default',
    'base',
    'generator',
    'updater'
  ]));

  app.task('delete', function(cb) {
    del('.temp-trees', cb);
  });

  app.task('docs', function(cb) {
    return app.src('docs/trees.md', {cwd: __dirname})
      .pipe(app.renderFile('*'))
      .pipe(app.dest(app.cwd));
  });

  app.task('default', ['trees', 'readme', 'docs', 'delete']);
};
