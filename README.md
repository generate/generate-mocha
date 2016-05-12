# generate-mocha [![NPM version](https://img.shields.io/npm/v/generate-mocha.svg?style=flat)](https://www.npmjs.com/package/generate-mocha) [![NPM downloads](https://img.shields.io/npm/dm/generate-mocha.svg?style=flat)](https://npmjs.org/package/generate-mocha) [![Build Status](https://img.shields.io/travis/generate/generate-mocha.svg?style=flat)](https://travis-ci.org/generate/generate-mocha)

Generate mocha test files.

## TOC

- [Install](#install)
- [CLI](#cli)
  * [Flags](#flags)
- [Usage as a plugin](#usage-as-a-plugin)
- [Usage as a sub-generator](#usage-as-a-sub-generator)
- [Tasks](#tasks)
- [API](#api)
  * [Install](#install-1)
  * [Usage](#usage)
- [Related projects](#related-projects)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

## Install

Install globally with [npm](https://www.npmjs.com/)

```sh
$ npm install -g generate-mocha
```

![gen-mocha](https://cloud.githubusercontent.com/assets/383994/15221990/bb9c4e6e-183b-11e6-9c41-d85c7edcad77.gif)

## CLI

**Installing the CLI**

To run the `generate-mocha` generator from the command line, you'll need to install [generate](https://github.com/generate/generate) globally first. You can that now with the following command:

```sh
$ npm i -g generate
```

This adds the `gen` command to your system path, allowing it to be run from any directory. Visit the [generate](https://github.com/generate/generate) project and documentation to learn more.

**Run the `generate-mocha` generator from the command line**

Once both [generate](https://github.com/generate/generate) and `generate-mocha` are installed globally, you can run the generator with the following command:

Run the `generate-mocha` generator from the command line:

```sh
$ gen generate-mocha
```

### Flags

#### --tmpl

Choose the template to use.

**Default**: [templates/test.js](templates/test.js)

**Shortcut**: `-t`

**Choices**:

Currently the only choices are:

* `base`: template for adding unit tests to [base](https://github.com/node-base/base) projects.
* `test`: generic mocha unit tests template

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

## Usage as a plugin

You can use generate-mocha as a [sub-generator](https://github.com/generate/generate){docs/sub-generators}. See the [generate](https://github.com/generate/generate) docs for more details.

```js
app.register('foo', require('generate-mocha'));
```

This adds the namespace `foo` to

## Usage as a sub-generator

Extend your generator with the features and settings of this generator.

**Example**

```js
app.use(require('generate-mocha'));
```

## Tasks

### [unit-test](generator.js#L91)

This task is used in unit tests to ensure this generator works in all intended scenarios.

**Example**

```sh
$ gen mocha:unit-test
```

### [templates](generator.js#L107)

Pre-load templates. This is called by the [default](#default) task, but if you call this task directly make sure it's called after collections are created.

**Example**

```sh
$ gen mocha:templates
```

### [questions](generator.js#L138)

Loads the `project.name` and `project.alias` questions onto the `question.queue` to be asked when the `.ask` method is called. This is called by the [default](#default) task.

**Example**

```sh
$ gen mocha:questions
```

### [dest](generator.js#L160)

Prompt the user for the `dest` directory to use for the generated test file(s). Called by the [default](#default) task.

**Example**

```sh
$ gen mocha:dest
```

### [files](generator.js#L180)

Initiate a prompt session to ask the user which files to write to disk.

**Example**

```sh
$ gen mocha:files
```

### [test](generator.js#L195)

Generate a `test.js` file to the user's working directory.

**Example**

```sh
$ gen mocha:test
```

### [default](generator.js#L228)

Generate a `test.js` file to the user's working directory. Alias for the [test](#test) task.

**Example**

```sh
$ gen mocha
```

## API

To use this generator as a node.js module - as a plugin or sub-generator, you must first install the generator locally.

### Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install generate-mocha
```

### Usage

Then use in your project:

```js
var generate-mocha = require('generate-mocha');
```

**Use as a plugin**

In your [generate](https://github.com/generate/generate) project:

```js
var generate = require('generate');
var app = generate();

app.use(generate-mocha);
```

**Use as a generator plugin**

In your [generate](https://github.com/generate/generate) generator:

```js
module.exports = function(app) {
  app.use(generate-mocha);
};
```

**Use as a sub-generator**

In your [generate](https://github.com/generate/generate) generator:

```js
module.exports = function(app) {
  // name the sub-generator whatever you want
  app.register('foo', require('generate-generate-mocha'));
};
```

## Related projects

You might also be interested in these projects:

* [generate-git](https://www.npmjs.com/package/generate-git): Generator for initializing a git repository and adding first commit. | [homepage](https://github.com/generate/generate-git)
* [generate-license](https://www.npmjs.com/package/generate-license): Generate a license file for a GitHub project. | [homepage](https://github.com/generate/generate-license)
* [generate-node](https://www.npmjs.com/package/generate-node): Generate a node.js project, with everything you need to begin writing code and easily publish… [more](https://www.npmjs.com/package/generate-node) | [homepage](https://github.com/generate/generate-node)
* [generate](https://www.npmjs.com/package/generate): Fast, composable, highly extendable project generator with a user-friendly and expressive API. | [homepage](https://github.com/generate/generate)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/generate/generate-mocha/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/generate/generate-mocha/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on May 12, 2016._