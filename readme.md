# parallel-download
[![travis](https://travis-ci.org/ReklatsMasters/parallel-download.svg)](https://travis-ci.org/ReklatsMasters/parallel-download)
[![npm](https://img.shields.io/npm/v/parallel-download.svg)](https://npmjs.org/package/parallel-download)
[![license](https://img.shields.io/npm/l/parallel-download.svg)](https://npmjs.org/package/parallel-download)
[![downloads](https://img.shields.io/npm/dm/parallel-download.svg)](https://npmjs.org/package/parallel-download)
[![Code Climate](https://codeclimate.com/github/ReklatsMasters/parallel-download/badges/gpa.svg)](https://codeclimate.com/github/ReklatsMasters/parallel-download)
[![Test Coverage](https://codeclimate.com/github/ReklatsMasters/parallel-download/badges/coverage.svg)](https://codeclimate.com/github/ReklatsMasters/parallel-download)
[![bitHound Score](https://www.bithound.io/github/ReklatsMasters/parallel-download/badges/score.svg)](https://www.bithound.io/github/ReklatsMasters/parallel-download)
[![bitHound Dependencies](https://www.bithound.io/github/ReklatsMasters/parallel-download/badges/dependencies.svg)](https://www.bithound.io/github/ReklatsMasters/parallel-download/master/dependencies/npm)


>Parallel downloads files to the buffer.

### install
```bash
npm i parallel-download
```

### usage

```js
const pd = require('parallel-download');

pd(['http://example.com/one', 'http://example.com/two'])
	.then(res => {/* ... */})
```

### Breaking changes between 0.3 and 1.0

* now work with ES6
* supports nodejs **>=4**
* all interfaces used `Promise` instead of callbacks
* removed `queue` mode and `maxSize`, `tryTimeout`, `stream` options.
* **extremely small size**

### License
MIT, 2015 (c) Dmitry Tsvettsikh
