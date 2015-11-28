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
			res.error[0].should.be.instanceof(Error).and.have.keys('url', 'response');
			res.error[0].url.should.be.eql(url3);
		})
	})

  it('should fork fastest, then timeout', function() {
    this.timeout(5e3);

    const timeout = 5e2;
    const start = Date.now();
    const url = "http://localhost:5555/one/two";

    return download(url, {timeout})
      .then((res) => {
        const end = Date.now();

        process.nextTick(function() {
          should(end - start).below(timeout);

          res.should.have.property('error');
          res.error.should.be.an.Array().and.have.length(1);
          res.error[0].should.be.instanceof(Error);
          res.error[0].url.should.be.eql(url);
        })
      })
  })

	describe('timeout', function() {
		this.timeout(5e3);
		var app;
		const timeout = 5e2;

		before(function(done){
			app = http.createServer(function(req, res) {
				res.writeHead(200, {'Content-Type':'text/plain'});

				setTimeout(() => {
					res.end(new Buffer(Math.random().toString()));
				}, timeout*2);
			});

			app.listen(5555, function(){
				done();
			});
		});

		after(function(done){
			app.close(function(){
				done();
			});
		});

		it('should work', () => {
			const start = Date.now();
			const url = "http://localhost:5555/one/two";

			return download(url, {timeout})
				.then(function(res) {
					const end = Date.now();

					process.nextTick(function() {
						should(end - start).above(timeout);

						res.should.have.property('error');
						res.error.should.be.an.Array().and.have.length(1);
						res.error[0].should.be.instanceof(Error);
						res.error[0].url.should.be.eql(url);
					})
				})
			;
		})
	})

	describe('retries', function() {
		var requests = 0;
		const timeout = 5e2;

		before(function(done){
			app = http.createServer(function(req, res) {
				res.writeHead(200, {'Content-Type':'text/plain'});

				setTimeout(() => {
					res.end(new Buffer(Math.random().toString()));
				}, timeout*2);

				++requests;
			});

			app.listen(5555, function(){
				done();
			});
		});

		after(function(done){
			app.close(function(){
				done();
			});
		});

		it('should work', () => {
			const retries = 2;
			var opts = {url: "http://localhost:5555/42", retries, timeout};

			return download(opts)
				.then(res => {
					res.should.be.empty();
					res.error.should.have.length(1);

					should(requests).be.eql(retries);
				})
			;
		})
	})

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

      app.listen(3355, function(){
        done();
      });
    });

    after(function(done){
      app.close(function(){
        done();
      });
    });

    it('should work', () => {
      var url1 = "http://localhost:3355/one?q=1&w=2";
      var url2 = "http://localhost:3355/one/two";

      var start = Date.now();
      return download([url1, url2]).then(() => {
        var end = Date.now();
        should(end - start).below(timeout * 2);
      })
    })
  })
	
	it('follow errors', () => {
		var url = "http://localhost:5555/one";
		var promise = download(url, { followErrors: true, timeout:1e3 });
		
		return promise.should.be.a.Promise().and.rejected;
	})
});
