'use strict';

// based on feross/run-parallel
module.exports = function (tasks, opts, cb) {
  var results, pending, completed, errors = [];
  
  if (typeof opts === 'function') {
    cb = opts;
  }

  if (Array.isArray(tasks)) {
    results = [];
    pending = tasks.length;
    completed = Array.apply(null, new Array(tasks.length));
  }

  function done (i, err, result) {
  	if (completed[i]) {
  		return;
  	}  	
  	completed[i] = true;
  	if (err) {
    	errors.push(err);
    } else {
    	results.push(result);
    }
    if (--pending === 0) {
      cb && cb(errors.length ? errors : null, results);
      cb = null;
    }
  }

  if (!pending) {
    // empty
    cb && cb(null, results);
    cb = null;
  } else {
    // array
    tasks.forEach(function (task, i) {
      task(done.bind(undefined, i));
    });
  }
};