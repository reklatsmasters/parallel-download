'use strict';

var http         = require('http');
var download     = require('../index');
var should       = require('should');

/* global describe, it, before, after, beforeEach */

describe('многоразовая загрузка', function(){
	var app;
	var fails = 3;

	before(function(done){
		app = http.createServer(function(req, res) {
			if (fails) {
				res.writeHead(404, {'Content-Type':'text/plain'});
				res.end();
			} else {
				res.writeHead(200, {'Content-Type':'text/plain'});
				res.end('123456');
			}

			--fails;
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

	beforeEach(function(){
		fails = 3;
	});

	it('неудачная загрузка с 1й попытки', function(done){
		download('http://localhost:3555/one', function(err){
			should(fails).equal(2);

			should(err).be.ok.and.be.Array.and.have.length(1);
			should(err[0].error).be.Error;

			done();
		});
	});

	it('удачная загрузка', function(done){
		download('http://localhost:3555/two', {reps:5}, function(err, succ){
			should(fails).equal(-1);

			should(err).not.be.ok;
			(err === null).should.be.true;

			succ.should.be.an.Array.and.have.length(1);
			succ[0].should.be.an.Object;
			succ[0].should.have.properties('url', 'filename', "content");
			succ[0].content.should.be.instanceof(Buffer).and.have.length(6);
			succ[0].url.should.be.an.String.and.be.equal("http://localhost:3555/two");
			should(succ[0].filename).not.be.ok;
			should(succ[0].filename === null).be.true;

			done();
		});
	});

	it('неудачная загрузка', function(done){
		download('http://localhost:3555/three', {reps:3}, function(err){
			should(fails).equal(0);

			should(err).be.ok.and.be.Array.and.have.length(1);
			should(err[0].error).be.Error;

			done();
		});
	});

	it('загрузка нескольких ссылок', function(done){
		download(['http://localhost:3555/4',
		         'http://localhost:3555/5'], {reps:2}, function(err, succ){

			should(fails).equal(-1);

			should(err).be.ok.and.be.Array.and.have.length(1);
			should(err[0].error).be.Error;

			succ.should.be.an.Array.and.have.length(1);
			succ[0].should.be.an.Object.and.have.properties('url', 'filename', "content");

			done();
		});
	});

	it('очерёдная загрузка нескольких ссылок', function(done){
		download(['http://localhost:3555/6',
		         'http://localhost:3555/7'], {reps:5, mode:"queue"}, function(err, succ){

			should(fails).equal(-6);

			should(err).be.ok.and.be.Array.and.have.length(1);
			should(err[0].error).be.Error;
			err[0].url.should.be.an.String.and.be.equal("http://localhost:3555/7");

			succ.should.be.an.Array.and.have.length(1);
			succ[0].url.should.be.an.String.and.be.equal("http://localhost:3555/6");

			done();
		});
	});
});