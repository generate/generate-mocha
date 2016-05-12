  it('should export an object', function(cb) {
    var stream = <%= camelcase(project.alias) %>();
    var buffer = [];

    stream.write(new File({
      base: __dirname,
      path: __dirname + '/file.txt'
    }));

    stream.on('data', function(file) {
      buffer.push(file);
    });

    stream.on('end', function() {
      assert.equal(buffer.length, 1);
      assert.equal(buffer[0].relative, 'file.txt');
      cb();
    });
    
    stream.end();
  });
