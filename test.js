'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var vinylMd5 = require('./');
var crypto = require('crypto');
var MemoryStream = require('memorystream');
var through = require('through2');
var Promise = require('native-or-bluebird');
var transform = require('vinyl-transform');
var map = require('map-stream');

var stream;
var promises;
beforeEach(function() {
	promises = [];
	stream = through.obj();
});

describe('plugin ', function() {
	it('should add an md5Value property for buffers', function (cb) {
		stream
			.pipe(vinylMd5())
			.on('data', function (file) {
				assert.strictEqual(file.md5Value, md5('unicorns'));
			})
			.on('error', cb)
			.on('end', cb);

		writeTestBuffer();
	});

	it('should add an md5Promise property for streams', function (cb) {
		stream
			.pipe(vinylMd5())
			.on('data', function (file) {
				file.md5Promise.then(function(result) {
					assert.strictEqual(result, md5('unicorns'));
				}).catch(cb);
			})
			.on('error', cb)
			.on('end', cb);

		writeTestStream();
	});
});

describe('#getMd5Value ', function() {
	it('should return the md5Value at the point of call (if plugin is not used) ', function(cb) {
		stream
			.pipe(assertGetValue('unicorns'))
			.pipe(setBufferContents('puppies'))
			.pipe(assertGetValue('puppies'))
			.on('error', cb)
			.on('end', cb)
			.resume();

		writeTestBuffer();
	});

	it('should return the md5Value at the point of plugin use ', function(cb) {
		stream
			.pipe(vinylMd5())
			.pipe(assertGetValue('unicorns'))
			.pipe(setBufferContents('puppies'))
			.pipe(assertGetValue('unicorns'))
			.pipe(vinylMd5())
			.pipe(assertGetValue('puppies'))
			.on('error', cb)
			.on('end', cb)
			.resume();

		writeTestBuffer();
	});
});

describe('#getMd5Promise (Buffers) ', function() {
	it('should return the md5Value at the point of call (if plugin is not used) ', function(cb) {
		stream
			.pipe(assertGetPromise('unicorns'))
			.pipe(setBufferContents('puppies'))
			.pipe(assertGetPromise('puppies'))
			.on('error', cb)
			.on('end', checkPromises(cb))
			.resume();

		writeTestBuffer();
	});

	it('should return the md5Value at the point of plugin use ', function(cb) {
		stream
			.pipe(vinylMd5())
			.pipe(assertGetPromise('unicorns'))
			.pipe(setBufferContents('puppies'))
			.pipe(assertGetPromise('unicorns'))
			.pipe(vinylMd5())
			.pipe(assertGetPromise('puppies'))
			.on('error', cb)
			.on('end', checkPromises(cb))
			.resume();

		writeTestBuffer();
	});
});

describe('#getMd5Promise (Streams)', function() {
	it('should return the md5Value at the point of call (if plugin is not used) ', function(cb) {
		stream
			.pipe(assertGetPromise('unicorns'))
			.pipe(upperCase())
			.pipe(assertGetPromise('UNICORNS'))
			.on('error', cb)
			.on('end', checkPromises(cb))
			.resume();

		writeTestStream();
	});

	it('should return the md5Value at the point of plugin use ', function(cb) {
		stream
			.pipe(vinylMd5())
			.pipe(assertGetPromise('unicorns'))
			.pipe(upperCase())
			.pipe(assertGetPromise('unicorns'))
			.pipe(vinylMd5())
			.pipe(assertGetPromise('UNICORNS'))
			.on('error', cb)
			.on('end', checkPromises(cb))
			.resume();

		writeTestStream();
	});
});

function assertGetValue(value) {
	return through.obj(function(file, enc, next) {
		assert.strictEqual(vinylMd5.getMd5Value(file), md5(value));
		next(null, file);
	});
}

function upperCase() {
	return transform(function(filename) {
		return map(function(chunk, next) {
			return next(null, chunk.toString().toUpperCase());
		});
	});
}

function assertGetPromise(value) {
	return through.obj(function(file, enc, next) {
		promises.push(
			vinylMd5.getMd5Promise(file).then(function(result) {
				assert.strictEqual(result, md5(value));
			})
		);
		next(null, file);
	});
}

function setBufferContents(contents) {
	return through.obj(function(file, enc, next) {
		file.contents = new Buffer(contents);
		next(null, file);
	});
}

function md5(input) {
	return crypto.createHash('md5').update(input).digest('hex');
}

function writeTestBuffer() {
	_write(new Buffer('unicorns'));
}

function writeTestStream() {
	var contents = new MemoryStream(['uni','corns']);

	setTimeout(function() {
		contents.end();
	}, 30);

	_write(contents);
}

function _write(contents) {
	stream.push(new gutil.File({
		base: __dirname,
		path: __dirname + '/file.ext',
		contents: contents
	}));

	stream.push(null);
}

function checkPromises(cb) {
	return function() {
		Promise.all(promises)
			.then(function() {
				cb();
			}).catch(cb);
	};
}
