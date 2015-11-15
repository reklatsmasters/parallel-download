'use strict';

const http     = require('http');
const download = require('../');
const should   = require('should');

/* global describe, it, before, after */

describe('func download', () => {
	var app;

	before(function(done){
		app = http.createServer(function(req, res) {
			res.writeHead(200, {'Content-Type':'text/plain'});
			res.end(new Buffer(Math.random().toString()));
		});

		app.listen(3555, function(){
			done();
		});
	});

	after(function(done){
		app.close(function(){
			done();
		});
	});

	it('single', () => {
		var url = "http://localhost:3555/one?q=1&w=2";
		var state = download(url);

		state.should.be.a.Promise().and.fulfilled();
		return state.then(res => {
			res.should.be.an.Array().and.have.length(1);

			var data = res[0];

			data.should.be.instanceof(http.IncomingMessage);
			data.url.should.be.eql(url);
			data.content.should.be.instanceof(Buffer);
		});
	});

	it('group', () => {
		var url1 = "http://localhost:3555/one?q=1&w=2";
		var url2 = "http://localhost:3555/one/two";
		var state = download([url1, url2]);

		state.should.be.a.Promise().and.fulfilled();
		return state.then(res => {
			res.should.be.an.Array().and.have.length(2);

			res[0].url.should.be.eql(url1);
			res[1].url.should.be.eql(url2);
		})
	})

	it('handle errors', () => {
		var url1 = "http://localhost:3555/one?q=1&w=2";
		var url2 = "http://localhost:3555/one/two";
		var url3 = "http://example.com/error";

		var state = download([url1, url2, url3]);

		state.should.be.a.Promise().and.fulfilled();
		return state.then(res => {
			res.should.be.an.Array().and.have.length(2);

			res[0].url.should.be.eql(url1);
			res[1].url.should.be.eql(url2);

			res.should.have.property('error');
			res.error.should.be.an.Array().and.have.length(1);
			res.error[0].should.be.instanceof(Error);
			res.error[0].url.should.be.eql(url3);
		})
	})

	describe('retries', function() {
		this.timeout(5e3);

		var timeout = 1e3; // 1s

		it('decrease var', () => {
			var opts = {url: "http://example.com/error", retries: 2};

			return download(opts)
				.then(res => {
					res.should.be.empty();
					res.error.should.have.length(1);
					opts.retries.should.be.eql(0);
				})
			;
		})
	})
});

describe('parallel mode', () => {
	var app;
	const timeout = 400;

	before(function(done){
		app = http.createServer(function(req, res) {
			res.writeHead(200, {'Content-Type':'text/plain'});

			setTimeout(() => {
				res.end(new Buffer(Math.random().toString()));
			}, timeout);
		});

		app.listen(3555, function(){
			done();
		});
	});

	after(function(done){
		app.close(function(){
			done();
		});
	});

	it('should work', () => {
		var url1 = "http://localhost:3555/one?q=1&w=2";
		var url2 = "http://localhost:3555/one/two";

		var start = Date.now();
		return download([url1, url2]).then(() => {
			var end = Date.now();
			should(end - start).below(timeout * 2);
		})
	})
})
