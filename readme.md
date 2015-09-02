# gulp-vinyl-md5 [![Build Status](https://travis-ci.org/jamestalmage/gulp-vinyl-md5.svg?branch=master)](https://travis-ci.org/jamestalmage/gulp-vinyl-md5)

> My perfect gulp plugin


## Install

```
$ npm install --save-dev gulp-vinyl-md5
```


## Usage

```js
var gulp = require('gulp');
var vinylMd5 = require('gulp-vinyl-md5');

gulp.task('default', function () {
	return gulp.src('src/file.ext')
		.pipe(vinylMd5())
		.pipe(gulp.dest('dist'));
});
```


## API

### vinylMd5(options)

#### options

##### foo

Type: `boolean`  
Default: `false`

Lorem ipsum.


## License

MIT © [James Talmage](http://github.com/jamestalmage)
