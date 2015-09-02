'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var crypto = require('crypto');

module.exports = function (options) {
	/*if (!options.foo) {
		throw new gutil.PluginError('gulp-vinyl-md5', '`foo` required');
	}*/

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-vinyl-md5', 'Streaming not supported'));
			return;
		}

		try {
			var md5 = crypto.createHash('md5');
			md5.update(file.contents, 'utf8');
			file.md5 = md5.digest('hex');
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-vinyl-md5', err));
		}

		cb();
	});
};
