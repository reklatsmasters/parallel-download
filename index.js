'use strict';

const get = require('simple-get');
const co  = require('co');
const url = require('url');
const attachment = require('content-disposition');
const concat = require('concat-stream');
const promisify = require("es6-promisify");

const got = promisify(get);

/**
 * Get filename from content-disposition header
 * @param  {string} contentDisposition header
 * @return {string|null}               filename or null
 */
function filename(contentDisposition) {
  return contentDisposition ?
    attachment.parse(contentDisposition).parameters.filename :
    null
  ;
}

/**
 * chained wrapper around the downloader
 * @param  {string|object} url url or request config
 * @return {Promise}     promise, resolved to IncomingMessage or null
 */
function down(url) {
  var realUrl = (typeof url == 'string') ? url : url.url;

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
      res.filename = filename(res.headers['content-disposition']);
      res.url = realUrl;

      return res;
    })
    .catch(err => {
      err.url = realUrl;
      return err;
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
