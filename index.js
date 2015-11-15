'use strict';

const get = require('simple-get');
const co  = require('co');
const url = require('url');
const concat = require('concat-stream');
const promisify = require("es6-promisify");

const got = promisify(get);

/**
 * chained wrapper around the downloader
 * @param  {string|object} url url or request config
 * @return {Promise}     promise, resolved to IncomingMessage or null
 */
function down(url) {
  var retries = url.retries || 1;

  var realUrl = (typeof url == 'string') ? url : url.url;
  var opts = (typeof url == 'string') ? {url, retries} : url;

  return got(url)
    .then(res => {
      if (~~(res.statusCode / 100) != 2) {
        return Promise.reject(new Error(res.statusCode));
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
      res.url = realUrl;

      return res;
    })
    .catch(err => {
      if (--opts.retries <= 0) {
        err.url = realUrl;
        return err;
      }

      return down(opts);
    })
  ;
}

/**
 * download files in parallel
 * @param  {array} urls array of urls to download
 * @return {Promise} array with responses than success downloaded
 */
function* download(_urls) {
  var urls = Array.isArray(_urls) ? _urls : [_urls];
  var status = yield urls.map(down);

  var success = [], error = [];

  for(let res of status) {
    let choice = (res instanceof Error) ? error : success;
    choice.push(res);
  }

  status.length = 0;
  success.error = error;

  return success;
}

module.exports = co.wrap(download);
