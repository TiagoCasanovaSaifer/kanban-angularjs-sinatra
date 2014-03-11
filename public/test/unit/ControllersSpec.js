'use strict';

/* jasmine specs for controllers go here */
describe('Kanban controllers', function() {
  
  var scope, $browser, ctrl;
  var storageServiceMock = {
    enabled: false,
    // return item value
    getB: function(item) {
      return false;
    },
    // return item value
    getN: function(item) {
      return 0;
    },
    // return item value
    get: function(item) {
      return null;
    },
    set: function(item, value) {
      // set item value
      //doNothing
    }
  }

  beforeEach(function() {
    // console.log(myApp);

    angular.mock.module('myApp');
    module('ngResource');

    //module('myApp'); 
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(
  inject(function($controller, $rootScope, _$httpBackend_) {
    //scope = $rootScope;
    
    // console.log("JERE");
    // console.log(myApp.controller('KanbanCtrl'));
    //create an empty scope
    var mockBackend = $httpBackend_;
    scope = $rootScope.$new();
    console.log("SCOPE: ");
    console.log(scope);
    ctrl = $controller('KanbanCtrl', {
        $scope: scope,
      localStorageService: storageServiceMock,
      webServiceStorage: _$httpBackend_
    });

    
    // console.log("ERROR");
    // console.log(ctrl);
  })

  );

  describe('KanbanCtrl', function() {

    /*describe("Create a new kanban", function() {
      it("backlog tasks should be empty", function(){
        console.log(scope.controlEnterTipEnabled);
        //expect(scope.backlogTasks).toBe([]);
      });*/

      // it("not show Criar form on init", function() {
      //   expect(scope.showCriar).toBe(false);
      // });
      // it('should create "kanban" from template', function() {
      //   expect(scope.kanban_template()['columns'].length == 5);
      // });

      // it('have no kanban on init', function() {
      //   expect(scope.kanbans.length).toBe(0);
      // });

      // it('have no kanban at init', function() {
      //   expect(scope.getCurrentKanban()).toBe(undefined);
      //   expect(scope.kanbans.length).toBe(0);
      // });

      // it('create a new kanban with a name', function() {
      //   scope.new_kanban_name = "NOVO KANBAN";
      //   scope.newKanban();
      //   expect(scope.kanbans.length).toBe(1);
      //   expect(scope.getCurrentKanban()).not.toBe(undefined);
      //   expect(scope.getCurrentKanban().name).toBe("NOVO KANBAN");
      //   expect(true).toBe(true);
      // });

    /*});*/



  });
});