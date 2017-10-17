  beforeEach(function() {
    app = <%= suite.name %>({cli: true, silent: true});
    app.option('dest', actual());
    app.cwd = actual();

    // see: https://github.com/jonschlinkert/ask-when
    app.option('askWhen', 'not-answered');

    // set default data to use in templates. feel free to
    // remove anything that isn't used (e.g. if "username"
    // isn't defined in templates, just remove it)
    app.data(pkg);
    app.data('project', pkg);
    app.data('username', 'foo');
    app.data('owner', 'foo');
  });
