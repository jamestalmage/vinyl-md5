'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var crypto = require('crypto');
var Promise = require('native-or-bluebird');

function gulpPlugin() {
	return through.obj(function (file, enc, cb) {
		try {
			// remove cached values from upstream plugins
			file.md5Value = file.md5Promise = null;
			if (file.isBuffer()) {
				file.md5Value = getMd5Value(file);
			}
			else if(file.isStream())  {
				var self = this;
				file.md5Promise =	getMd5Promise(file)
					.catch(function(err) {
						throw emitError(self, err);
					});
			}
		} catch (err) {
			emitError(this, err);
		}
		cb(null, file);
	});
}

function emitError(ctx, err) {
	ctx.emit('error', new gutil.PluginError('gulp-vinyl-md5', err));
	return err;
}

function getMd5Value(file) {
	var md5 = file.md5Value;
	if (!md5) {
		if (!file.isBuffer()) {
			throw new Error('getMd5Value only supports Buffers');
		}
		md5 = crypto.createHash('md5')
			.update(file.contents, 'utf8')
			.digest('hex');
	}
	return md5;
}

function getMd5Promise(file) {
	if (file.md5Promise) {
		return file.md5Promise;
	}
	if (file.isBuffer()) {
		return Promise.resolve(getMd5Value(file));
	} else if (file.isStream()) {
		return new Promise(function makePromise(resolve, reject) {
			var md5 = crypto.createHash('md5');
			file.contents = file.contents.pipe(through(
				function transform(chunk, enc, cb) {
					md5.update(chunk, enc);
					this.push(chunk);
					cb();
				},
				function flush(cb) {
					resolve(md5.digest('hex'));
					cb();
				}
			));
		});
	} else {
		throw new Error('getMd5Promise: file must be buffer or stream');
	}
}

gulpPlugin.getMd5Value = getMd5Value;
gulpPlugin.getMd5Promise = getMd5Promise;
module.exports = gulpPlugin;
