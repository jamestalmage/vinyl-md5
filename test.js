'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var vinylMd5 = require('./');
var crypto = require('crypto');

it('should add an md5 property ', function (cb) {
	var stream = vinylMd5();

	stream.on('data', function (file) {
		assert.strictEqual(
			file.md5,
			crypto.createHash('md5').update('unicorns').digest('hex')
		);
	});

	stream.on('end', cb);

	stream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.ext',
		contents: new Buffer('unicorns')
	}));

	stream.end();
});
