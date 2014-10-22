'use strict';

var parallel = require('../parallel');
var should = require('should');

/* global describe, it */

describe('проверка параллелизма', function(){
	it('должен работать параллельно', function(done){
		var start = Date.now();

		var task1 = function(cb) {
			setTimeout(cb, 400);
		};

		var task2 = function(cb) {
			setTimeout(cb, 200);
		};

		parallel([task1, task2], function(){
			var end = Date.now();
			should(end - start).below(600);
			done();
		});
	});

	it('при ошибке все задачи должны отрабатывать', function(done){
		var task1 = function(cb) {
			setTimeout(cb, 400);
		};

		var task2 = function(cb) {
			setTimeout(cb, 200, new Error('some error'));
		};

		parallel([task1, task2], function(err, succ){
			err.should.be.Array;
			succ.should.be.Array;

			err.should.have.length(1);
			succ.should.have.length(1);

			done();
		});
	});

	it('при отсутствии ошибок, `error` должен быть null', function(done) {
		var task1 = function(cb) {
			setTimeout(cb, 400);
		};

		var task2 = function(cb) {
			setTimeout(cb, 200);
		};

		parallel([task1, task2], function(err){
			should(err).not.be.Array.and.not.be.ok;
			(err === null).should.be.true;
			done();
		});
	});
});