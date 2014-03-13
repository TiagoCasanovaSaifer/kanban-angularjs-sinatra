'use strict';

/* jasmine specs for filters go here */
describe('Kanban filters', function() {
	var filter;


	beforeEach(function() {
		angular.mock.module('myApp');
		this.addMatchers({
			toEqualData: function(expected) {
				return angular.equals(this.actual, expected);
			}
		});
	});

	
	describe('newlines', function() {
		it('should replace new lines', inject(function(newlinesFilter) {
			expect(newlinesFilter('line1\nline2')).toEqual('line1<br/>line2');
		}));
	});

	describe('noHTML', function(){
		it('sanitizes html tags', inject(function(noHTMLFilter){
			expect(noHTMLFilter('<span>Hi</span>')).toEqual("&lt;span&gt;Hi&lt;/span&gt;");
			expect(noHTMLFilter('&')).toEqual("&amp;");
		}));

	})

	describe('getBy', function(){
		it('filters a list by a field', inject(function(getByFilter){
			var list = [
				{id: 3},
				{id: 1},
				{id: 2}
			];
			expect(getByFilter('id', list, 1)).toEqualData({id: 1});
			expect(getByFilter('id', list, 2)).toEqualData({id: 2});
			expect(getByFilter('id', list, 3)).toEqualData({id: 3});
			expect(getByFilter('id', list, 4)).toBe(null);
		}));	
	});
});