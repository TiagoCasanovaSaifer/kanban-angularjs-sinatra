'use strict';

/* jasmine specs for controllers go here */
describe('Kanban services', function() {

  describe('Kanban Provider Service', function(){

  	beforeEach(function() {
    angular.mock.module('myApp');
    //module('myApp'); 
    //module('ngResource');
    //module('myApp'); 
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

/*  beforeEach(inject(function($rootScope){
  	
  }));*/

  	it('has current Provider null if none provider were previously setted', inject(function($rootScope, kanbanProviderService){
  		//var scope = $rootScope.$new();
  		expect(kanbanProviderService.getCurrentProvider()).toBe(null);
  	}));

  	it('throws error if call methods before set a provider', inject(function($rootScope, kanbanProviderService){
  		//var scope = $rootScope.$new();
  		expect(function() { kanbanProviderService.getKanbans(); }).toThrow(new Error("provider not setted"));
  	}));

  	it('throws error when calling methods with a unknown provider', inject(function($rootScope, kanbanProviderService){
  		kanbanProviderService.setCurrentProvider('new');
  		expect(function() { kanbanProviderService.getKanbans(); }).toThrow(new Error("unknown provider: new"));
  	}));

  	it('throws error when calling methods not implemented by provider', inject(function($rootScope, kanbanProviderService){
  		kanbanProviderService.setCurrentProvider('Dropbox');
  		expect(function() { kanbanProviderService.destroyKanban(null); }).toThrow(new Error("Not yet implemented"));
  	}));

  	it('allow define current provider', inject(function(kanbanProviderService){
  		kanbanProviderService.setCurrentProvider('Gitlab');
	  	expect(kanbanProviderService.getCurrentProvider()).toBe("Gitlab");
  	}));

		it('have provider service', inject(function(kanbanProviderService){	  	
	  	expect(kanbanProviderService).not.toBe(null);
	  }));

	  it('return provider which matches current setted provider', inject(function($rootScope, kanbanProviderService, webServiceStorage, localStorageService, dropboxService, gitlabService){
			expect(kanbanProviderService.getCurrentProvider()).toBe(null);
	  	kanbanProviderService.setCurrentProvider('Gitlab');
	  	expect(kanbanProviderService.getProviderInstance()).toEqualData(gitlabService);
	  }));
    
  });


});