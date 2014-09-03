// based on feross/run-parallel
module.exports = function (tasks, cb) {
  var results, pending, errors = []
  if (Array.isArray(tasks)) {
    results = []
    pending = tasks.length
  }

  function done (err, result) {
  	if (result) {
    	results.push(result)
    }
    if (err) {
    	errors.push(err);
    }
    if (--pending === 0) {
      cb && cb(errors.length ? errors : null, results)
      cb = null
    }
  }

  if (!pending) {
    // empty
    cb && cb(null, results)
    cb = null
  } else {
    // array
    tasks.forEach(function (task) {
      task(done)
    })
  }
}