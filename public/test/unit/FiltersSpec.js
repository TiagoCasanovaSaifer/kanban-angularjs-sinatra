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
});