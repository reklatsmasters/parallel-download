'use strict';

const get = require('simple-get');
const co  = require('co');
const concat = require('concat-stream');
const promisify = require("es6-promisify");
const timeout = require('timed-out');

const got = promisify(function(opts, cb) {
  var req = get(opts, cb);
  timeout(req, opts.timeout || 60e3)
});

const isString = (s) => typeof s === 'string';

/**
 * chained wrapper around the downloader
 * @param  {object} opts request config
 * @return {Promise}     promise, resolved to IncomingMessage or null
 */
function down(opts) {
  if (!opts.hasOwnProperty('retries')) {
    opts.retries = 1;
  }

  var url = opts.url;

  return got(opts)
    .then(res => {
      if (~~(res.statusCode / 100) != 2) {
        let err = new Error(res.statusCode);
        err.response = res;
        return Promise.reject(err);
      }

      return res;
    })
    .then(res => {
      return new Promise(resolve => {
        res.pipe(concat(data => {
          res.content = data;
          resolve(res);
        }))
      })
    })
    .then(res => {
      res.url = url;

      return res;
    })
    .catch(err => {
      if (--opts.retries <= 0) {
        err.url = url;
        return opts.followErrors ? Promise.reject(err) : err;
      }

      return down(opts);
    })
  ;
}

/**
 * download files in parallel
 * @param  {array} _urls array of urls to download
 * @param {object} _opts [optional] shared config
 * @return {Promise} array with responses than success downloaded
 */
function* download(_urls, _opts) {
  var opts = _opts || {};
  var urls = Array.isArray(_urls) ? _urls : [_urls];
  var status = yield urls.map(url => down( Object.assign(opts, isString(url) ? {url} : url) ));

  var success = [], error = [];

  for(let res of status) {
    let select = (res instanceof Error) ? error : success;
    select.push(res);
  }

  status.length = 0;
  success.error = error;

  return success;
}

module.exports = co.wrap(download);
