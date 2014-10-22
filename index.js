'use strict';

var parallel = require('./parallel')
	, request = require("request")
	, assign = require('object-assign')
	, MemoryStream = require('memory-stream')
	;

/**
 * @class
 * @param {object} [opts] - Options for <request>
 */
function Downloader(opts) {
	this.opts = opts || {};
	this.opts.encoding = null;
	this.opts.timeout = ('timeout' in this.opts) ? this.opts.timeout : 60*1000;
	this.tasks = [];
}

Downloader.prototype = function() {

	var scope = {
		constructor: Downloader
	};

	var generator = function(url, opts) {
		// task func
		return function(cb) {
			var memstream = new MemoryStream()
				, name = null
				;

			memstream.on('finish', function() {
				cb(null, {url:url, filename:name, content:memstream.toBuffer()});
			});

			request.get(url, opts)
			.on("error", function(err){
				cb({url:url, error:err});
			})
			.on('response', function (res) {
				if (res.statusCode < 200 || res.statusCode >= 300) {
					return cb({url:url, error: new Error(res.statusCode)});
				}

				if (res.headers.hasOwnProperty("content-disposition")) {
					var attach = res.headers["content-disposition"];
					var posLeft = attach.indexOf('"');

					name = attach.slice(posLeft+1, -1);
				}

				res.pipe(memstream);
			})
			;
		};
	};

	/* @typedef {string} Url */

	/**
	 * @param {Url|Url[]} url
	 * @param {object} [opts] - Options for <request>
	 */
	scope.get = function(url, opts) {
		opts = assign({}, this.opts, opts);

		if (typeof url === "string") {
			this.tasks.push( generator(url, opts) );
		} else if (Array.isArray(url)) {
			url.forEach(function(item){
				this.tasks.push( generator(item, opts) );
			}, this);
		} else {
			throw new TypeError("Argiment 1: expected string or array");
		}

		return this;
	};

	/**
	 * @typedef ResultHash
	 * @type {object}
	 * @property {Url} url
	 * @property {Buffer} content - Downloaded data
	 * @property {null|String} filename - File name from `content-disposition` header
	 */

	 /**
	  * @typedef ErrorHash
	  * @type {object}
	  * @property {Url} url
	  * @property {Error} error
	  */

	/**
	 * @callback RunCallback
	 * @param {null|ErrorHash[]} err - Array of errors
	 * @param {ResultHash[]} result 
	 */

	/**
	 * @param {RunCallback} cb
	 */
	scope.run = function(cb) {
		parallel(this.tasks, cb);
	};

	return scope;
}.call(null);

/**
 * Simple parallel downloader
 * @param {Url|Url[]} urls
 * @param {object}  [opts]
 * @param {RunCallback} cb  
 */
function download(urls, opts, cb) {
	/*jshint validthis:true */
	if (this instanceof download) {
		opts = opts || urls;
		return new Downloader(opts);
	}

	if (!Array.isArray(urls) && (typeof urls !== "string")) {
		throw new TypeError("Expected string or array");
	}

	if (typeof opts === "function") {
		cb = opts;
		opts = {};
	}

	var d = new Downloader(opts);
	d.get(urls);
	d.run(cb);
}

module.exports = download;