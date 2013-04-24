myApp.controller('ProjectSelectionCtrl', function($scope, $rootScope, webServiceStorage, $route, $routeParams, $location, $q) {
	$rootScope.localStorageEnabled = false;
	$rootScope.dropboxServiceEnabled = false;

	$scope.$route = $route;
	$scope.$routeParams = $routeParams;

	$scope.currentProject = $routeParams.project_name;
	$scope.showProjetoSelection = true;

	console.log($routeParams);
	$scope.projects = webServiceStorage.Project.query(function(data) {
		for (i = 0; i < data.length; i++) {
			var value = data[i];
			if (value.name == $routeParams.project_name) {
				$scope.currentProject = value.name;
				$scope.showProjetoSelection = false;
				$scope.kanbans = webServiceStorage.Kanban($scope.currentProject).get();

			}
		}
	});


	$scope.kanbans = [];
	$scope.novoProjeto = '';
	$scope.path = function() {
		return $location.path()
	};

	$scope.projectChanged = function() {
		$location.path('projeto/' + $scope.currentProject);
	};

	$scope.kanbanChanged = function() {
		$location.path('projeto/' + $scope.currentProject + "/" + $scope.currentKanban._id);
	};

	$scope.addNewProject = function() {
		var projeto = new webServiceStorage.Project();
		projeto.name = $scope.novoProjeto;
		$scope.novProjeto = '';
		projeto.$save(function(projeto) {
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
		console.log($location);
		console.log($scope.$route.current);
		console.log($scope.$routeParams);
		$scope.projects = webServiceStorage.Project.query();

	});

	$scope.retornar = function() {
		window.history.back();
	}
});

myApp.controller('KanbanCtrl', function($scope, $routeParams, $rootScope, dropboxService, localStorageService, webServiceStorage, $q) {
	$scope.dropboxFile = "";
	$scope.dropboxFiles = [];
	//console.log(dropboxService);

	$scope.templateFromWebService = webServiceStorage.KanbanTemplate.get();

	$scope.columnFilter = function(indice) {
		if($scope.getCurrentKanban() == null || $scope.getCurrentKanban() == undefined) {
			return {};
		}
		var filter = {
			status_id: $scope.getCurrentKanban().status[indice]._id
		}
		console.log(filter);
		return filter;
	}

	$scope.connectToDropbox = function() {
		if (dropboxService !== undefined) {
			console.log(dropboxService);
			if (!dropboxService.isAuthenticated()) {
				dropboxService.authenticate();
			}

			//$scope.dropboxFiles = dropboxService.getFiles;

			var promisegetKanbans = dropboxService.getKanbans();

			promisegetKanbans.then(function(entries) {
				$scope.dropboxFiles = entries
			}, function(error) {
				alert(error);
			});
		}
	}
	$scope.getCurrentKanban = function() {
		return $scope.kanban;
	}
	$scope.hideControlEnterTip = function(column) {
		return (column.newTask.text == '');
	};
	$scope.showControlEnterTip = function(column) {
		return (column.newTask.text != '');
	};


	$scope.saveToDropBox = function() {
		dropboxService.save($scope.current_kanban_name + ".txt", JSON.stringify($scope.kanban));
	};

	$scope.controlEnterTipEnabled = false;

	$scope.kanban_desserialize_text = "";

	$scope.kanbans = localStorageService.get('kanbans');
	if ($scope.kanbans === null || $scope.kanbans === '') {
		$scope.kanbans = [];
		localStorageService.set('kanbans', []);
	}

	if ($scope.kanbans.length > 0) {
		$scope.kanban = localStorageService.get($scope.kanbans[0]);
		$scope.current_kanban_name = $scope.kanban.name;
	}

	$scope.statuses = [{
		name: 'Planejando (Backlog)'
	}, {
		name: 'Projetando'
	}, {
		name: 'Em Desenvolvimento'
	}, {
		name: 'Testando'
	}, {
		name: 'Entregue'
	}, ];

	$scope.kanban = webServiceStorage.getLastKanban();

	console.log($scope.kanban);

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

	$scope.kanban_template = function(name_kanban) {
		if ($scope.templateFromWebService != null) {
			var kanban = jQuery.extend(true, {}, $scope.templateFromWebService);
			console.log(kanban);
			jQuery.each(kanban.status, function(index, column) {
				column.seq = index + 1;
				if (index == 0) {
					column.form_template = 'form-template1.html';
					column.css_template = "template1";
					column.size = "span3";
				} else {
					column.form_template = 'form-template2.html';
					column.css_template = 'template2';
					column.size = 'span2';
				}
			});
			return kanban;
		} else {
			return {
				name: name_kanban,
				columns: [{
					name: 'Planejando (Backlog)',
					seq: 1,
					tasks: [],
					newTask: {},
					form_template: 'form-template1.html',
					css_template: 'template1',
					size: "span3"

				}, {
					name: 'Projetando',
					seq: 2,
					tasks: [],
					newTask: {},
					form_template: 'form-template2.html',
					css_template: 'template2',
					size: "span2"
				}, {
					name: 'Em desenvolvimento',
					seq: 3,
					tasks: [],
					newTask: {},
					form_template: 'form-template2.html',
					css_template: 'template2',
					size: "span2"
				}, {
					name: 'Testando',
					seq: 4,
					tasks: [],
					newTask: {},
					form_template: 'form-template2.html',
					css_template: 'template2',
					size: "span2"
				}, {
					name: 'Entregue',
					seq: 5,
					tasks: [],
					newTask: {},
					form_template: 'form-template2.html',
					css_template: 'template2',
					size: "span2"
				}]
			};
		}
	};


	$scope.tasksKeypressCallback = function($event, column) {
		$scope.addTask(column);
		$event.preventDefault();
	};

	//$scope.currentColumn = $scope.kanban.columns[0];

	$scope.deleteAllKanbans = function() {
		$scope.clearLocalStorage();
		$scope.kanbans = [];
		$scope.kanban = null;
	};

	$scope.clearLocalStorage = function() {
		for (var i = 0; i < $scope.kanbans.length; i++) {
			localStorageService.set($scope.kanbans[i], null);
		}
		localStorageService.set("kanbans", []);
	};

	$scope.addTask = function(column) {
		$scope.kanban.columns[0].tasks.push(column.newTask);
		$scope.kanban.columns[0].newTask = {
			text: ""
		};
	};

	$scope.saveKanban = function() {
		localStorageService.set($scope.kanban.name, $scope.kanban);
		if ($.inArray($scope.kanban.name, $scope.kanbans) == -1) {
			$scope.kanbans.push($scope.kanban.name);
			localStorageService.set("kanbans", $scope.kanbans);
		}
	};


	$scope.showCriar = false;
	$scope.loadDropboxFiles = function() {
		$scope.dropboxFiles = dropboxService.getFiles();
	}
	$scope.newKanban = function() {
		$scope.kanban = $scope.kanban_template($scope.new_kanban_name);
		$scope.saveKanban();
		$scope.current_kanban_name = $scope.kanban.name;
		$scope.new_kanban_name = "";
		$scope.showCriar = false;
	};

	$scope.importFromText = function() {
		$scope.kanban = JSON.parse($scope.kanban_desserialize_text);
		$scope.saveKanban();
		$scope.current_kanban_name = $scope.kanban.name;
		$scope.showImport = false;
		$scope.kanban_desserialize_text = "";
	}


	$scope.kanbanSelectChanged = function() {
		$scope.carregarKanban($scope.current_kanban_name);
	};

	$scope.dropboxChanged = function() {
		var file = $scope.dropboxFile;
		dropboxService.getKanbanFile(file);
		$scope.getCurrentKanban = dropboxService.getCurrentKanban;
	}

	$scope.deleteItem = function(column, index) {
		column.tasks.splice(index, 1);
	};

	var currentEditingTask = {};
	$scope.setCurrentEditingTask = function(column, index) {
		currentEditingTask = column.tasks[index];
	};

	$scope.getEditingTask = function() {
		return currentEditingTask;
	};

	$scope.carregarKanban = function(name) {
		if (name === null) {
			name = $scope.kanban.name;
		}
		var kanban = localStorageService.get(name);
		if (kanban != null) {
			$scope.kanban = kanban;
		}
	};
	//$scope.kanbans = ['Kanban','Kanban1', "Kanban2"];
});