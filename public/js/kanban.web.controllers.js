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
		var kanban = KanbanResource.get({kanbanId: $scope.currentKanban._id}, function(kanban) {
			webServiceStorage.setLastKanban(kanban);
			$location.path('projeto/' + $scope.currentProject + "/" + $scope.currentKanban._id);
		})
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

myApp.controller('KanbanCtrl', function($scope, $filter, $routeParams, $rootScope, kanbanRefreshService, $location, localStorageService, webServiceStorage, gitlabService, $q, $parse) {
	$scope.templateFromWebService = webServiceStorage.KanbanTemplate.get();

	/*$scope.taskUpdated = function(targetIdentity, moveData) {
		for(var i=0; i < moveData.origin.length ; i++ ){
			var task = moveData.origin[i];
			task.seq = i;
			task.id = task._id;
			var taskData = new $scope.TaskResource(task);

			taskData.$save(function(){
				if(moveData != null && moveData.origin.length > 0) {
					var status_id = moveData.origin[0].status_id;
					kanbanRefreshService.sendMessage({
							type: 'status',
							project_name: $scope.projectName, 
							kanban_id: $scope.kanban._id,
							status_id: status_id
					});
				}
			});
		}

		//console.log(moveData.origin);
	}*/
	$scope.taskMoved = function(targetIdentity, moveData) {
		//console.log(moveData);
		//console.log(targetIdentity);
		var task = moveData.dest[moveData.destPosition];
		var origIdentity = task.status_id;

		function enviarMsgAtualizacao() {
			var statusOrigem = $filter('getBy')('tasks', $scope.kanban.status, moveData.origin);
			var statusDestino = $filter('getBy')('tasks', $scope.kanban.status, moveData.dest);
			//console.log(status);
			if(statusOrigem != null) {
				kanbanRefreshService.sendMessage({
						type: 'status',
						project_name: $scope.projectName, 
						kanban_id: $scope.kanban._id,
						status_id: statusOrigem._id
				});
			}
			if(statusDestino != null) {
				kanbanRefreshService.sendMessage({
						type: 'status',
						project_name: $scope.projectName, 
						kanban_id: $scope.kanban._id,
						status_id: statusDestino._id
				});
			}
		}
		//alterar todas as tasks a partir da task movida até o fim da lista alvo
		task.id = task._id;
		task.status_id = targetIdentity;
		task.position = moveData.destPosition;
		var taskData = new $scope.TaskResource(task);
		taskData.$move(enviarMsgAtualizacao);
	};

	$scope.backlogTasks = [];
	$scope.getBacklogTasks = function() {	
		var statusTasksResource = webServiceStorage.StatusTasks($routeParams.project_name, $routeParams.kanban_id,$scope.getCurrentKanban().status[0]._id);
				$scope.backlogTasks = statusTasksResource.query();
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

	function setupKanbanRefreshService() {
		//configura o kanbanRefreshService para escutar atualizações do kanban corrente
		kanbanRefreshService.setup($scope.kanban._id, function(data){
			//console.log(data);
			//console.log(typeof data);
			if(typeof data === 'object'){
				if(data.kanban_id == $scope.kanban._id) {
					var status = $filter('getBy')('_id',$scope.kanban.status, data.status_id);
					if(data.type){
						status.tasks = data.tasks;
					} else {
						var task = $filter('getBy')('_id', status.tasks, data.task._id);
						var task_index = status.indexOf(task);
						status[task_index] = data.task
					}
					$scope.$apply();
				}
			}
		});
	}

	if($scope.kanban == null || $scope.kanban == undefined) {
	 	$scope.kanban = KanbanResource.get({kanbanId: $routeParams.kanban_id}, function(){
	 		setupKanbanRefreshService();
	 	})
	}
	else {
		//console.log($scope.kanban._id);
		setupKanbanRefreshService();
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
			//console.log($scope);
			kanbanRefreshService.sendMessage({
				type: 'status',
				project_name: $scope.projectName, 
				kanban_id: $scope.kanban._id,
				status_id: column._id
			});

			if($scope.gitlabProject != null){
				gitlabService.createIssue($scope.gitlabProject.id, task.text, '').
					then(function(data){
						task.external_source = 'gitlab';
						task.external_data = data;
						task.$save();
					}, 
					function(){
						alert('Não foi possível adicionar item ao gitlab: Projeto - ' + $scope.gitlabProject.name);
					});
			}
		});
	};




	$scope.deleteItem = function(column, index) {
		var taskData = new $scope.TaskResource({id: column.tasks[index]._id});
		taskData.$remove(function(){
			column.tasks.splice(index, 1);
			kanbanRefreshService.sendMessage({
				type: 'status',
				project_name: $scope.projectName, 
				kanban_id: $scope.kanban._id,
				status_id: column._id
			});
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
		var taskResource = new $scope.TaskResource($scope.currentEditingTask);
		taskResource.$save(function(){
			var task = $scope.currentEditingColumn.tasks[$scope.currentEditingIndex];
			task.text = $scope.currentEditingTask.text;
			kanbanRefreshService.sendMessage({
					type: 'task',
					project_name: $scope.projectName, 
					kanban_id: task.kanban_id,
					status_id: task.status_id,
					task_id: task.id
				});
		});
	}

	$scope.color = {};

	$scope.colorDrop = {};


	$scope.dropColorCallback = function(event, ui, taskScope) {
		
		if(ui.draggable.hasClass('color_badge'))
		{
			taskScope.task.color = taskScope.taskColor;
			taskScope.task.id = taskScope.task._id;
			var taskData = new $scope.TaskResource(taskScope.task);
			taskData.$save(function(){
				kanbanRefreshService.sendMessage({
					type: 'task',
					project_name: $scope.projectName, 
					kanban_id: taskScope.task.kanban_id,
					status_id: taskScope.task.status_id,
					task_id: taskScope.task.id
				});
			});
		}
	}

	$scope.colorDragStart = function() {

	};

	$scope.colorDragStop = function() {

	};

	$scope.colorDragCallback = function() {

	};

	$scope.gitlabProjects = [];
	$scope.gitLabIssues = [];

	//gitlabService.configure('https://gitlab.com/api/v3', 'eNmvdzADZsuErzVV7PNp');
	gitlabService.configure('https://gitlab.com/api/v3', null);

	$scope.doGitlabLogin = function(){
		gitlabService.login($scope.gitlab_login, $scope.gitlab_password).then(function(user){
			$scope.getGitLabProjectNames();
		},function(data){
			alert('Autenticação falhou: ' + data.message)
		});
	}

	$scope.getGitLabProjectNames = function(){

      gitlabService.getProjects().then(function(data){
        //$scope.gitlabProjects = data;
        $scope.gitlabProjects = [];
        for(idx in data){
          $scope.gitlabProjects.push(data[idx]);
        }
      });
	};

	$scope.gitlabProjectChanged = function(){
		gitlabService.getIssues($scope.gitlabProject.id).then(function(data){
			console.log(data);
		});
	}

	$scope.getGitLabIssues = function(){

	};
});


myApp.controller('SocketTestCtrl', function($scope, socket) {
	$scope.socket_data = [];
	socket.onconnect(function(args){
		console.log(args);
	});

	socket.ondisconnect(function(args){
		console.log(args);
	});
	$scope.enviarMensagem = function() {
		socket.emit('kanban-refresh', {kanban_id: 2, text: $scope.mensagem});
	}

	socket.on('kanban-refresh', function(){
		console.log(arguments);
		$scope.socket_data.push(arguments);
	});

	socket.emit('registerToKanbanChannel', {kanban_id: 2});

})