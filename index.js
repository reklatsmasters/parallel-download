var parallel = require('./parallel')
	, request = require("request")
	, assign = require('object-assign');
	;

/**
 * @class
 * @param {object} [opts] - Options for <request>
 */
function Downloader(opts) {
	this.opts = opts || {};
	this.opts.encoding = null;
	this.tasks = [];
};

Downloader.prototype = function() {

	var scope = {
		constructor: Downloader
	};

	var generator = {
		get: function(url, opts) {
			return function(cb) {
				var data = []
					, name = null
					;

				request.get(url, opts)
				.on("error", function(err){
					cb({url:url, error:err});
				})
				.on("data", function(chunk){
					data.push(chunk);
				})
				.on('response', function (res) {
					if (res.statusCode < 200 || res.statusCode >= 300) {
						cb({url:url, error: new Error(res.statusCode)});
						return;
					}

					if (res.headers.hasOwnProperty("content-disposition")) {
						var attach = res.headers["content-disposition"];
						var posLeft = attach.indexOf('"');

						name = attach.slice(posLeft+1, -1);
					}
				})
				.on("end", function() {
					cb(null, {url:url, filename:name, content:Buffer.concat(data)});
				});
			};
		}
	};

	/* @typedef {string} Url */

	/**
	 * @param {Url|Url[]} url
	 * @param {object} [opts] - Options for <request>
	 */
	scope.get = function(url, opts) {
		opts = assign({}, this.opts, opts);

		if (typeof url === "string") {
			this.tasks.push( generator.get(url, opts) );
		} else if (Array.isArray(url)) {
			url.forEach(function(item){
				this.tasks.push( generator.get(item, opts) );
			}, this);
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
	if (this instanceof download) {
		opts = opts || urls;
		return new Downloader(opts);
	}

	if (!Array.isArray(urls) && (typeof urls !== "string")) {
		throw new TypeError("Expected url or array of urls");
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