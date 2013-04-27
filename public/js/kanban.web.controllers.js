myApp.controller('ProjectSelectionCtrl', function($scope, $rootScope, webServiceStorage, $route, $routeParams, $location, $q) {
	$rootScope.localStorageEnabled = false;
	$rootScope.dropboxServiceEnabled = false;

	$scope.$route = $route;
	$scope.$routeParams = $routeParams;

	$scope.currentProject = $routeParams.project_name;
	$scope.showProjetoSelection = true;

	//console.log($routeParams);
	$scope.projects = webServiceStorage.Project.query(function(data) {
		for (i = 0; i < data.length; i++) {
			var value = data[i];
			if (value.name == $routeParams.project_name) {
				$scope.currentProject = value.name;
				$scope.showProjetoSelection = false;
				$scope.kanbans = $rootScope.kanbans = webServiceStorage.Kanban($scope.currentProject).query();
			}
		}
	});

	$scope.showKanbansList = function() {
		return ($rootScope.kanbans != undefined && $rootScope.kanbans.length > 0);
	};


	$scope.kanbans = [];
	$scope.novoProjeto = '';
	$scope.path = function() {
		return $location.path()
	};

	$scope.projectChanged = function() {
		$location.path('projeto/' + $scope.currentProject);
	};

	$scope.kanbanChanged = function() {
		var KanbanResource = webServiceStorage.Kanban($scope.currentProject);
		var kanban = KanbanResource.get({kanbanId: $scope.currentKanban._id})
		webServiceStorage.setLastKanban(kanban);
		$location.path('projeto/' + $scope.currentProject + "/" + $scope.currentKanban._id);
	};

	$scope.addNewProject = function() {
		var projeto = new webServiceStorage.Project();
		projeto.name = $scope.novoProjeto;
		$scope.novProjeto = '';
		projeto.$save(function(projeto) {
			$scope.showProjetoSelection = false;
			$location.path('projeto/' + projeto.name);
		});

	}

	$scope.addNewKanban = function() {
		var KanbanResource = webServiceStorage.Kanban($scope.currentProject);
		var kanban = new KanbanResource();
		kanban.name = $scope.novoKanban;
		kanban.$save(function(kanban) {
			webServiceStorage.setLastKanban(kanban);
			$location.path('projeto/' + $scope.currentProject + '/' + kanban._id);
		});

	}

	$scope.$watch(function() {
		return $location.path()
	}, function() {
		//console.log($location);
		//console.log($scope.$route.current);
		//console.log($scope.$routeParams);
		$scope.projects = webServiceStorage.Project.query();

	});

	$scope.retornar = function() {
		window.history.back();
	}
});

myApp.controller('KanbanCtrl', function($scope, $routeParams, $rootScope, $location, localStorageService, webServiceStorage, $q, $parse) {
	$scope.templateFromWebService = webServiceStorage.KanbanTemplate.get();

$scope.taskUpdated = function(targetIdentity, moveData) {
		for(var i=0; i < moveData.origin.length ; i++ ){
			var task = moveData.origin[i];
			task.seq = i;
			task.id = task._id;
			var taskData = new $scope.TaskResource(task);
			taskData.$save();
		}
		//console.log(moveData.origin);
}
	$scope.taskMoved = function(targetIdentity, moveData) {
		//console.log(moveData);
		//console.log(targetIdentity);

		var task = moveData.dest[moveData.destPosition];
		var origIdentity = task.status_id;
		//alterar todas as tasks a partir da task movida até o fim da lista algo
		
		task.id = task._id;
		task.status_id = targetIdentity;
		task.destPosition = moveData.destPosition;
		var taskData = new $scope.TaskResource(task);
		taskData.$reArrange(function() {
			//reorganiza a lista de origem do elemento movido
		 	var taskData = new $scope.TaskResource({id: task._id, status_id: origIdentity, originPosition: moveData.origPosition});
		 	taskData.$reArrangeOrigin();
		});
	};

	$scope.getCurrentKanban = function() {
		return $scope.kanban;
	}
	$scope.hideControlEnterTip = function(column) {
		return (column.newTask.text == '');
	};
	$scope.showControlEnterTip = function(column) {
		return (column.newTask.text != '');
	};

	$scope.navegar = function(projectName, kanban_id) {
		$location.path('projeto/' + projectName + '/' + kanban_id);
		webServiceStorage.setLastKanban(null);
	};

	$scope.projectName = $routeParams.project_name;

	$scope.controlEnterTipEnabled = false;


	$scope.kanban = webServiceStorage.getLastKanban();

	$scope.TaskResource = webServiceStorage.Task($routeParams.project_name, $routeParams.kanban_id);

	var KanbanResource = webServiceStorage.Kanban($routeParams.project_name);

	if($scope.kanban == null || $scope.kanban == undefined) {
	 	$scope.kanban = KanbanResource.get({kanbanId: $routeParams.kanban_id})
	}

	if($rootScope.kanbans == null || $rootScope.kanbans == undefined) {
		$rootScope.kanbans = webServiceStorage.Kanban($routeParams.project_name).query();
	}

	$scope.removeColumn = function(index) {
		if (index == 0) {
			return;
		}
		$scope.getCurrentKanban().columns.splice(index, 1);
	};

	$scope.addColumn = function() {
		var new_column = $scope.newColumn($scope.newColumnName, $scope.getCurrentKanban().columns.length);
		$scope.getCurrentKanban().columns.push(new_column);
	};

	$scope.newColumn = function(name, index) {
		return {
			name: name,
			seq: index,
			tasks: [],
			newTask: {},
			form_template: 'form-template2.html',
			css_template: 'template2',
			size: "span3"
		}
	};

/*			columns: [{
				name: 'Planejando (Backlog)',
				seq: 1,
				tasks: [],
				newTask: {},
				form_template: 'form-template1.html',
				css_template: 'template1',
				size: "span3"

			} ... */


	$scope.tasksKeypressCallback = function($event, column) {
		$scope.addTask(column);
		$event.preventDefault();
	};


	$scope.addTask = function(column) {
		var task = new $scope.TaskResource();
		task.status_id = column._id;
		task.text = column.newTask.text;
		task.$save(function(task){
			column.tasks.push(task);
			column.newTask = {
				text: ""
			};
		});
	};




	$scope.deleteItem = function(column, index) {
		var taskData = new $scope.TaskResource({id: column.tasks[index]._id});
		taskData.$remove(function(){
			column.tasks.splice(index, 1);
		});
	};

	var currentEditingTask = {};
	$scope.setCurrentEditingTask = function(column, index) {
		var task = column.tasks[index];
		$scope.currentEditingTask ={
				id: task._id,
				status_id: task.status_id,
				text: task.text
			};
		$scope.currentEditingColumn = column;
		$scope.currentEditingIndex = index;
	};

	$scope.getEditingTask = function() {
		if($scope.currentEditingTask != undefined)
		{
			return $scope.currentEditingTask;
		}
		else
		{
			return {text: ''};
		}
	};

	$scope.changeTaskText = function() {
		var task = new $scope.TaskResource($scope.currentEditingTask);
		task.$save(function(){
			$scope.currentEditingColumn.tasks[$scope.currentEditingIndex].text = $scope.currentEditingTask.text;
		});
	}

	$scope.color = {};

	$scope.colorDrop = {};


	$scope.dropColorCallback = function(event, ui, scope) {
		if(ui.draggable.hasClass('color_badge'))
		{
			scope.task.color = scope.taskColor;
			scope.task.id = scope.task._id;
			var taskData = new $scope.TaskResource(scope.task);
			taskData.$save();
		}
	}

	$scope.colorDragStart = function() {

	}

	$scope.colorDragStop = function() {

	}

	$scope.colorDragCallback = function() {

	}
});
