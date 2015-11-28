# parallel-download
[![travis](https://travis-ci.org/ReklatsMasters/parallel-download.svg)](https://travis-ci.org/ReklatsMasters/parallel-download)
[![npm](https://img.shields.io/npm/v/parallel-download.svg)](https://npmjs.org/package/parallel-download)
[![license](https://img.shields.io/npm/l/parallel-download.svg)](https://npmjs.org/package/parallel-download)
[![downloads](https://img.shields.io/npm/dm/parallel-download.svg)](https://npmjs.org/package/parallel-download)
[![Code Climate](https://codeclimate.com/github/ReklatsMasters/parallel-download/badges/gpa.svg)](https://codeclimate.com/github/ReklatsMasters/parallel-download)
[![Test Coverage](https://codeclimate.com/github/ReklatsMasters/parallel-download/badges/coverage.svg)](https://codeclimate.com/github/ReklatsMasters/parallel-download)
[![bitHound Score](https://www.bithound.io/github/ReklatsMasters/parallel-download/badges/score.svg)](https://www.bithound.io/github/ReklatsMasters/parallel-download)
[![bitHound Dependencies](https://www.bithound.io/github/ReklatsMasters/parallel-download/badges/dependencies.svg)](https://www.bithound.io/github/ReklatsMasters/parallel-download/master/dependencies/npm)


>Download files in parallel to the buffer

### install
```bash
npm i parallel-download
```

### features

* work with super small http library [simple-get](https://github.com/feross/simple-get)
* work with ES6
* supports nodejs **>=4**
* `Promise` instead of callbacks
* **extremely small size** (< 100 lines of code)

### usage

```js
const pd = require('parallel-download');

pd(['http://example.com/one', 'http://example.com/two'])
	.then(res => {/* ... */})
```

### API

* `pd(url [, opts])`

###### param url (String|Array[String]|Object|Array[Object])

Url/config or array of urls/configs. Available options:

   * all options of [simple-get](https://github.com/feross/simple-get)
   * `timeout` - download timeout in ms, default 60s
   * `retries` - redownload on error, default 1
   * `followErrors` - don't catch errors. **Attention!** All pending requests will not aborted!

###### param opts (Object)
shared config, has a low priority

```js
pd({url:"http://example.com/", timeout: 5e3}, {timeout:10e3})
	.then(/* ... */);
// timeout is 5e3
```

###### return res (Promise<Array>)
This promise **always** resolved. Promise contains an array of [IncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage) instances with
additional fields:
* url (string) - original request url (*for identify each request*)
* content (Buffer) - ungzipped (if need) response (*or you can use res.pipe*)

Resolved array contain fields:
* error (Array[Error])

Each error object contain fields:
* all standart fields
* url (string) - original request url (*for identify each request*)


### Breaking changes between 0.3 and 1.0

* 100% rewrited
* removed `queue` mode and `maxSize`, `tryTimeout`, `stream` options.

### License
MIT, 2015 (c) Dmitry Tsvettsikh
