'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var vinylMd5 = require('./');
var crypto = require('crypto');
var MemoryStream = require('memorystream');

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

it('should add an md5 property ', function (cb) {
	var stream = vinylMd5();

	stream.on('data', function (file) {
		file.md5Promise.then(function(md5) {
			assert.strictEqual(
				md5,
				crypto.createHash('md5').update('unicorns').digest('hex')
			);
			cb();
		}).catch(cb);
	});

	var contents = new MemoryStream(['uni','corns']);

	stream.write(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.ext',
		contents: contents
	}));

	setTimeout(function() {
		contents.end();
	}, 20);

	stream.end();
});
