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


## API

### vinylMd5(options)

#### options

##### No options (yet).


## License

MIT © [James Talmage](http://github.com/jamestalmage)
