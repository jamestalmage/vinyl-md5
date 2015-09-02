# gulp-vinyl-md5 [![Build Status](https://travis-ci.org/jamestalmage/vinyl-md5.svg?branch=master)](https://travis-ci.org/jamestalmage/vinyl-md5)

> Adds md5 hash to vinyl file object


## Install

```
$ npm install --save-dev gulp-vinyl-md5
```


## Usage

```js
var gulp = require('gulp');
var vinylMd5 = require('gulp-vinyl-md5');
var through = require('through2');

gulp.task('with-buffers', function () {
	return gulp.src('src/file.ext')
		.pipe(vinylMd5())
		.pipe(through.obj(function(file, enc, next) {
			// md5 hash is on the file object.
			console.log(file.md5);
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

## Plugin Authors

The module provides two utility methods `getMd5Value(file)` and `getMd5Promise(file)`
that can be used by plugin authors as a common way of extracting md5 hashes.

`getMd5Value(file)` only works for Buffer files and synchronously returns the md5 hash of `file.contents`.
It will throw an error if the file is not a Buffer (i.e. isStream, isNull, or isDirectory).

`getMd5Promise(file)` works for Buffer or Stream files. It returns a promise that will eventually resolve
with the hash of `file.contents`. In the case of Stream files, that will not be until the
stream is empty, and has emitted an `end` event. 

If you only support Buffers, it is recommended to use `getMd5Value` as it is synchronous.

If you support Streams, you will need to use `getMd5Promise`. If your plugin depends on the md5 hash to perform
stream manipulation, you may need to buffer some/all of the stream until the promise resolves.

```js
var vinylMd5 = require('gulp-vinyl-md5');

// only Buffers? - do it synchronously
var md5 = vinylMd5.getMd5Value(file);

// Streams? 
vinylMd5.getMd5Promise(file).then(...);
```

Neither utility method requires that the plugin be used, however, using the plugin will cache the md5 value
at that particular point in the stream.

```js
gulp.src('./someFile.txt')
  .pipe(upperCaseTransform())
  .pipe(through.obj(function(file, enc, next) {
    vinylMd5.getMd5Value(file); // retrieves md5 hash AFTER the upperCaseTransform
  }));  
  
gulp.src('./someFile.txt')
  .pipe(vinylMd5()) // cache the md5 value
  .pipe(upperCaseTransform())
  .pipe(through.obj(function(file, enc, next) {
    vinylMd5.getMd5Value(file); // retrieves md5 hash BEFORE the upperCaseTransform, at the cache point
  }));  
```

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
  It has the added benefit of working with Streams.

## License

MIT © [James Talmage](http://github.com/jamestalmage)
