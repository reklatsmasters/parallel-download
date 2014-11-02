'use strict';

module.exports  = function(tasks, opts, cb) {
	var errors = [], success = [], completed = 0;

	if (typeof opts === 'function') {
	  cb = opts;
	}

	function done(err, succ) {
		if (err) {
			errors.push(err);
		} else {
			success.push(succ);
		}

		if (++completed >= tasks.length) {
			cb && cb(errors.length ? errors : null, success);
      		cb = null;
		} else {
			if (opts.timeout > 0) {
				setTimeout(function() {
					tasks[completed](done);
				}, opts.timeout);
			} else {
				tasks[completed](done);
			}
		}
	}

	if (tasks.length) {
		tasks[0](done);
	} else {
		cb && cb(null, success);
		cb = null;
	}
};