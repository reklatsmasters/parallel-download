'use strict';

var queue = require('../queue');
var should = require('should');

/* global describe, it */
describe('проверка очереди', function(){
	it('должен работать по очереди', function(done){
		var start = Date.now();

		var task1 = function(cb) {
			setTimeout(cb, 400);
		};

		var task2 = function(cb) {
			setTimeout(cb, 200);
		};

		queue([task1, task2], function(){
			var end = Date.now();
			should(end - start).above(600 - 10);
			done();
		});
	});

	it('должна работать пауза между задачами', function(done){
		var start = Date.now();

		var task1 = function(cb) {
			setTimeout(cb, 400);
		};

		var task2 = function(cb) {
			setTimeout(cb, 200);
		};

		queue([task1, task2], {timeout: 300}, function(){
			var end = Date.now();
			should(end - start).above(900 - 10);
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

		queue([task1, task2], function(err, succ){
			err.should.be.Array;
			succ.should.be.Array;

			err.should.have.length(1);
			succ.should.have.length(1);

			done();
		});
	});
});