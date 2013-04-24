var myApp = angular.module('myApp', ['ngView','ngResource', 'ui']);
 
  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
  
/*.
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/project')
  }]);
*/
/*
// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: MyCtrl1});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);
  */


angular.module('ui.config', []).value('ui.config', {
  sortable: {
    connectWith: '.grupo-items',
    delay: 30,
    distance: 2
  }
});

angular.module('ngView', [], function($routeProvider, $locationProvider) {
  $routeProvider.when('/', {controller: 'ProjectSelectionCtrl',  templateUrl: 'projectSelection.html'});
  $routeProvider.when("/projeto/:project_name", {controller: 'ProjectSelectionCtrl', templateUrl: 'projectSelection.html'});
  $routeProvider.when('/projeto/:project_name/:kanban_id', {controller: 'KanbanCtrl', templateUrl: 'kanban.html'})
});
//angular.bootstrap(document, ['myapp']);