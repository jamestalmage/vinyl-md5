# gulp-vinyl-md5 [![Build Status](https://travis-ci.org/jamestalmage/vinyl-md5.svg?branch=master)](https://travis-ci.org/jamestalmage/vinyl-md5)

> Extract md5 hashes from vinyl-file contents

## Install

```
$ npm install --save-dev gulp-vinyl-md5
```

The module provides two utility methods `getMd5Value(file)` and `getMd5Promise(file)`
that can be used by plugin authors as a common way of extracting MD5 hashes.

It also provides a gulp plugin that can cache the MD5 hash at an earlier point in the stream.
Neither utility method requires that the plugin be used, however, using the plugin will cache the MD5 hash
at that particular point in the stream.

```js
var gulp = require('gulp');
var gzip = require('gulp-gzip');
var vinylMd5 = require('gulp-vinyl-md5');

gulp.src('./someFile.txt')
  .pipe(gzip())
  .pipe(through.obj(function(file, enc, next) {
    // retrieves md5 hash at the current point, AFTER the `gzip()` transform
    vinylMd5.getMd5Value(file);
  }));  
  
gulp.src('./someFile.txt')
  .pipe(vinylMd5()) // cache the md5 value
  .pipe(gzip())
  .pipe(through.obj(function(file, enc, next) {
    // retrieves md5 hash at the cache point, BEFORE the `gzip()` transform.
    vinylMd5.getMd5Value(file);  
  }));  
```

If you only support Buffers, you should use `getMd5Value(file)` since it is synchronous.

## API

### vinylMd5()
  Provides a pipe-able duplex stream that caches the md5 value for use by downstream plugins.
  It does not change the contents of the file.

### vinylMd5.getMd5Value(file)
  For Buffers only. Returns the MD5 hash of the file contents. If the `vinylMd5()` plugin
  was used upstream, it returns the MD5 hash of the contents at the point where the plugin was inserted
  into the stream, otherwise it returns the MD5 hash of the contents at the current point.
  
### vinylMd5.getMd5Promise(file)
  Similar to `getMd5Value(file)`, but it returns an asynchronously resolved promise.
  It has the added benefit of working with Streams. If your plugin depends on the md5 hash to perform
  stream manipulation, you may need to buffer some/all of the stream until the promise resolves.
  

## Behind the scenes
The `vinylMd5()` plugin caches the results on one of two variables (`md5Value` or `md5Promise`):

```js
var gulp = require('gulp');
var vinylMd5 = require('gulp-vinyl-md5');
var through = require('through2');

gulp.task('with-buffers', function () {
	return gulp.src('src/file.ext')
		.pipe(vinylMd5())
		.pipe(through.obj(function(file, enc, next) {
			// md5 hash is on the file object.
			console.log(file.md5Value);
			this.push(file);
			next();
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('with-streams', function () {
	return gulp.src('src/file.ext', {buffer: false})
		.pipe(vinylMd5())
		.pipe(through.obj(function(file, enc, next) {
			// for streams it provides a promise that resolves when the stream completes.
			file.md5Promise.then(function(md5) {
			  console.log(md5);
			});
			this.push(file);
			next();
		}))
		.pipe(gulp.dest('dist'));
});
```

## License

MIT © [James Talmage](http://github.com/jamestalmage)
