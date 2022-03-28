# gulp-vinyl-size

[![Build Status](https://travis-ci.com/burntcustard/gulp-vinyl-size.svg?branch=master)](https://travis-ci.com/burntcustard/gulp-vinyl-size)
[![codecov](https://codecov.io/gh/burntcustard/gulp-vinyl-size/branch/master/graph/badge.svg)](https://codecov.io/gh/burntcustard/gulp-vinyl-size)
[![install size](https://packagephobia.com/badge?p=gulp-vinyl-size)](https://packagephobia.com/result?p=gulp-vinyl-size)

[![NPM](https://nodei.co/npm/gulp-vinyl-size.png?compact=true)](https://nodei.co/npm/gulp-vinyl-size/)

__[Gulp](https://www.npmjs.com/package/gulp) plugin to log the size of individual files (Vinyl objects) in the stream. A simpler, more flexible alternative to [gulp-size](https://www.npmjs.com/package/gulp-size).__

## Install

`$ npm install --save-dev gulp-vinyl-size`

## Basic Usage

```js
const gulp = require('gulp');
const size = require('gulp-vinyl-size');

function copyScripts() {
  return gulp
    .src('assets/scripts/*.js')
    .pipe(size())
    .pipe(gulp.dest('/dist/js/'));
}

// [13:01:44] main.js: 3.13 kB
// [13:01:45] demo.js: 1.09 kB
```

## Options

The first parameter is an options object.

### gzip (Default: `false`)

Additionally log gzipped-size.

```js
.pipe(size({gzip: true}))

// [12:32:22] main.js: 5.29 kB (2.18 kB gzipped)
```

### bytes (Default: `false`)

Log size in bytes rather than converting to kilobytes, megabytes, etc.

```js
.pipe(size({bytes: true}))

// [12:32:22] main.js: 5417 B
```

### filesize

All options get passed _directly_ to the size-prettifying package filesize. See [it's npm page](https://www.npmjs.com/package/filesize) for a full list of options.

```js
.pipe(size({base: 2, spacer: '|'}))

// [12:32:22] main.js: 5.29|KiB
```

## Callback function

The second parameter is a callback function that lets you do whatever you want with the size info, instead of it being logged automtically.

```js
.pipe(size({}, size => console.log(`Minified CSS: ${size}`))

// Minified CSS: 3.13 kB
```

[fancy-log](https://www.npmjs.com/package/fancy-log) can be used to keep the timestamp when logging via a callback.

```js
const log = require('fancy-log');
// ...
.pipe(size({}, size => log(`Minified CSS: ${size}`)))

// [12:32:22] Minified CSS: 3.13 kB
```

## Advanced usage

The parameter of the callback (which can be named anything, but `size` or `info` are recommended) is an object which outputs the size string when used within a template literal, but it also contains these properties:
- `sizeString` - Size _with_ gzipped size (if `gzip: true`). E.g. `'24 B (gzipped: 8 B)'`. Same as `info` directly in the callback.
- `size`       - Size _without_ gzipped size. E.g. just `'24 B'`.
- `gzip`       - Gzipped size, _available even if the `gzip` option is false_. E.g. `'8 B'`
- `filename`   - `file.relative` of the vinyl. E.g. `'main.js'`.

With these properties, multiple calls to gulp-vinyl-size, [fancy-log](https://www.npmjs.com/package/fancy-log) and [ansi-colors](https://www.npmjs.com/package/ansi-colors), detailed logging can be done, e.g.

```js
const gulp = require('gulp');
const size = require('gulp-vinyl-size');
const log = require('fancy-log');
const c = require('ansi-colors');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const purgecss = require('gulp-purgecss');

function css() {
  return gulp
    .src('src/scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .on('data', () => log('CSS'))
    .pipe(size({}, info => log(`└ transpiled ${color.magenta(info)}`)))
    .pipe(purgecss({content: ['**/*.php']}))
    .pipe(size({}, info => log(`└ purged     ${color.magenta(info)}`)))
    .pipe(cleanCSS())
    .pipe(size({}, info => log(`└ minified   ${color.magenta(info.size)} ${color.gray(`(gzipped: ${info.gzip})`)}`)))
    .pipe(gulp.dest('dist/css'));
}

// [11:02:38] Starting 'css'...
// [11:02:39] CSS
// [11:02:39] └ transpiled 29.06 kB
// [11:02:40] └ purged     6.31 kB
// [11:02:40] └ minified   3.13 kB (gzipped: 1.04 kB)
```
