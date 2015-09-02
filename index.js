'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var crypto = require('crypto');
var Promise = require('native-or-bluebird');

module.exports = function () {
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		var md5 = crypto.createHash('md5');
		if (file.isStream()) {
			file.md5Promise = new Promise(function(resolve, reject) {
				file.contents = file.contents.pipe(through(
					function(chunk, enc, cb) {
						md5.update(chunk, enc);
						this.push(chunk);
						cb();
					},
					function(cb) {
						resolve(md5.digest('hex'));
						cb();
					}
				));
			});
			this.push(file);
			cb();
			return;
		}

		try {
			md5.update(file.contents, 'utf8');
			file.md5 = md5.digest('hex');
			this.push(file);
		} catch (err) {
			this.emit('error', new gutil.PluginError('gulp-vinyl-md5', err));
		}

		cb();
	});
};
