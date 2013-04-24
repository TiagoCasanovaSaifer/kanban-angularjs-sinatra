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
    angular.mock.module('myApp');
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(
  inject(function($controller, $rootScope) {
    scope = $rootScope;
    ctrl = $controller('KanbanCtrl', {
      $scope: $rootScope,
      localStorageService: storageServiceMock
    });
  })

  );

  describe('KanbanCtrl', function() {

    describe("Create a new kanban", function() {

      it("not show Criar form on init", function() {
        expect(scope.showCriar).toBe(false);
      });
      it('should create "kanban" from template', function() {
        expect(scope.kanban_template()['columns'].length == 5);
      });

      it('have no kanban on init', function() {
        expect(scope.kanbans.length).toBe(0);
      });

      it('have no kanban at init', function() {
        expect(scope.getCurrentKanban()).toBe(undefined);
        expect(scope.kanbans.length).toBe(0);
      });

      it('create a new kanban with a name', function() {
        scope.new_kanban_name = "NOVO KANBAN";
        scope.newKanban();
        expect(scope.kanbans.length).toBe(1);
        expect(scope.getCurrentKanban()).not.toBe(undefined);
        expect(scope.getCurrentKanban().name).toBe("NOVO KANBAN");
      });

    });



  });
});