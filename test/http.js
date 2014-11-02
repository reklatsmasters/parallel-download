'use strict';

var http         = require('http');
var download     = require('../index');
var should       = require('should');

var Memorystream = require('memory-stream');
var fs           = require('fs');

/* global describe, it, before, after */

describe('проверка загрузчика', function () {
	var app;

	before(function(done){
		app = http.createServer(function(req, res) {
			res.writeHead(200, {'Content-Type':'text/plain'});
			res.end('123456');
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

	it('простой режим', function(done) {
		download(["http://localhost:3555/one"], function(err, succ){
			should(err).not.be.ok;
			(err === null).should.be.true;
			
			succ.should.be.an.Array;
			succ.should.have.length(1);

			succ[0].should.be.an.Object;
			succ[0].should.have.properties('url', 'filename', "content");
			
			succ[0].content.should.be.instanceof(Buffer).and.have.length(6);
			succ[0].url.should.be.an.String.and.be.equal("http://localhost:3555/one");

			should(succ[0].filename).not.be.ok;
			(succ[0].filename === null).should.be.true;

			done();
		});
	});

	it('объектный режим', function(done) {
		var d = new download();
		d.get("http://localhost:3555/two");
		d.run(function(err, succ){
			should(err).not.be.ok;
			(err === null).should.be.true;
			
			succ.should.be.an.Array;
			succ.should.have.length(1);

			succ[0].should.be.an.Object;
			succ[0].should.have.properties('url', 'filename', "content");
			
			succ[0].content.should.be.instanceof(Buffer).and.have.length(6);
			succ[0].url.should.be.an.String.and.be.equal("http://localhost:3555/two");

			should(succ[0].filename).not.be.ok;
			(succ[0].filename === null).should.be.true;

			done();
		});
	});

	it('параллельная загрузка', function(done) {
		var start = Date.now();

		download(["http://localhost:3555/one", "http://localhost:3555/two"], {mode:"parallel", tryTimeout: 300}, function(err, succ){
			var end = Date.now();

			should(err).not.be.ok;
			(err === null).should.be.true;
			
			succ.should.be.an.Array;
			succ.should.have.length(2);

			should(end - start).below(300);

			done();
		});
	});

	it('очерёдная загрузка', function(done) {
		var start = Date.now();

		download(["http://localhost:3555/one", "http://localhost:3555/two"], {mode:"queue", tryTimeout: 300}, function(err, succ){
			var end = Date.now();

			should(err).not.be.ok;
			(err === null).should.be.true;
			
			succ.should.be.an.Array;
			succ.should.have.length(2);

			should(end - start).above(300);

			done();
		});
	});

	describe('проверка потоков', function(){

		it('внешний буфер-поток', function(done){
			var d = new download();
			var memstream = new Memorystream();

			d.get("http://localhost:3555/three", {stream:memstream});
			d.run(function(){
				var mem = memstream.toBuffer();

				mem.should.be.an.instanceof(Buffer);
				mem.should.have.length(6);

				done();
			});
		});

		it('работа со сторонними типами потоков', function(done){
			var d = new download();
			var fstream = fs.createWriteStream('test.dat');

			d.get("http://localhost:3555/four", {stream:fstream});
			d.run(function() {
				should(fs.existsSync("test.dat")).be.true;
				
				var stat = fs.statSync("test.dat");
				stat.size.should.equal(6);
				
				fs.unlinkSync("test.dat");
				done();
			});
		});
	});
});