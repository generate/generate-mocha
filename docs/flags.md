#### --tmpl

Choose the template to use.

**Default**: [templates/test.js](templates/test.js)

**Shortcut**: `-t`

**Choices**:

Currently the only choices are:

- `base`: template for adding unit tests to [base][] projects.
- `test`: generic mocha unit tests template

#### --stem

Rename the `stem` of the destination file (basename excluding file extension):

**Default**: `test`

**Example**

```sh
$ gen mocha --stem foo
# results in `foo.js`
```

#### --basename

Rename the `basename` of the destination file.

**Default**: `test.js`

**Example**

```sh
$ gen mocha --basename foo.whatever
# results in `foo.whatever`
```