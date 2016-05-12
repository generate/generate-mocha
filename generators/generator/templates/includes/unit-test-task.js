/**
 * This task is used in unit tests to ensure this generator works in all intended
 * scenarios.
 *
 * ```sh
 * $ gen mocha:unit-test
 * ```
 * @name unit-test
 * @api public
 */

app.task('unit-test', function(cb) {
  app.base.set('cache.unit-test', true);
  cb();
});
