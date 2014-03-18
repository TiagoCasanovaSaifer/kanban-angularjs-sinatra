myApp.factory('kanbanProviderService', function($rootScope, webServiceStorage, localStorageService, dropboxService, gitlabService, $location){

  var callMethod = function(instance, methodName, arguments) {
    var func = instance[methodName];

    if(func == null) {
      throw new Error('Not yet implemented');
    }
    
    if(typeof(func) !== 'function') {
      throw new Error(methodName  + ' is not a function');
    }
    return func.apply(instance, arguments);
  };
  var providerService = {  
    currentProvider: null,
    providers: [],
    getCurrentProvider: function() {
      return this.currentProvider;
    },
    setCurrentProvider: function(provider) {
      this.currentProvider = provider;
    },
    getProviderInstance: function() {
      switch(this.currentProvider) {
        case 'Gitlab':
          return gitlabService;
        case 'WebService':
          return webServiceStorage;
        case 'Dropbox':
          return dropboxService;
        case 'Local':
          return localStorageService;
        case null: 
          throw new Error('provider not setted');
        default:
          throw new Error('unknown provider: ' + this.currentProvider);
      }
    },
    /* project calls */
    saveProject: function(project){
      callMethod(this.getProviderInstance(), 'saveProject');
    },
    destroyProject: function(project){
      callMethod(this.getProviderInstance(), 'destroyProject');
    },
    getProjects: function(){
      callMethod(this.getProviderInstance(), 'getProjects');
    },
    /* kanban calls */
    saveKanban: function(kanban){
      callMethod(this.getProviderInstance(), 'saveKanban');
    },
    
    destroyKanban: function(kanban){
      callMethod(this.getProviderInstance(), 'destroyKanban');
    },

    getKanbans: function(project){
      callMethod(this.getProviderInstance(), 'getKanbans');
    },

    /* kanbam item calls */
    saveKanbanItem: function(kanban_item){
      callMethod(this.getProviderInstance(), 'saveKanbanItem');
    },
    destroyKanbanItem: function(kanban_item){
      callMethod(this.getProviderInstance(), 'destroyKanbanItem');
    },
    getKanbanItems: function(kanban) {
      callMethod(this.getProviderInstance(), 'getKanbanItems');
    }, 
    getKanbanItemTemplate: function(kanban){
      callMethod(this.getProviderInstance(), 'getKanbanItemTemplate');
    },

    /* kanban templates calls */
    getTemplates: function(project){
      callMethod(this.getProviderInstance(), 'getTemplates');
    },

    /* kanban columns calls */
    getKanbanColumns: function(kanban){
      callMethod(this.getProviderInstance(), 'getKanbanColumns');
    }
    
  };
  return providerService;
});

myApp.factory('webServiceStorage', function($rootScope, $resource){
  var lastKanban = null;
  return {
    setLastKanban: function(kanban) {
      lastKanban = kanban;
    },
    getLastKanban: function(kanban) {
      return lastKanban;
    },
    KanbanTemplate:  $resource('./kanban_template', {}),
    Project:   $resource('./project/:projectId', {projectId: '@id'}),
    Kanban : function(name) {return $resource('./project/:projectName/kanban/:kanbanId',  {projectName:name, kanbanId:'@id'})},
    Task: function(name,kanbanId) {
      return $resource('./project/:projectName/kanban/:kanbanId/task/:taskId',  {projectName:name, kanbanId: kanbanId, taskId: '@id'},
        {
          move: {method: 'POST', params: {move: true}}
        });
    },
    StatusTasks: function(name, kanbanId, statusId) {
      return $resource('./project/:projectName/kanban/:kanbanId/status/:statusId/tasks', {projectName:name, kanbanId: kanbanId, statusId: statusId});
    }
    };

});

myApp.factory('localStorageService', function($rootScope) {

  function supports_html5_storage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  return {
    enabled: supports_html5_storage(),
    // return item value
    getB: function(item) {
      return JSON.parse(localStorage.getItem(item) || 'false');
    },
    // return item value
    getN: function(item) {
      return JSON.parse(localStorage.getItem(item) || '0');
    },
    // return item value
    get: function(item) {
      return JSON.parse(localStorage.getItem(item) || null);
    },
    set: function(item, value) {
      // set item value
      localStorage.setItem(item, JSON.stringify(value));
    }

  };
});

myApp.factory('dropboxService', function($rootScope, $q) {

  var service = {};

  service.client = new Dropbox.Client({
    key: "Tw+XNmNFT1A=|35pkqvfkp+KlI0yNp4dn9w79s8PrHQeRctgebHNYIw==",
    sandbox: true
  });

  var files = [];

  service.currentKanban = null;

  service.client.authDriver(new Dropbox.Drivers.Redirect({
    rememberUser: true
  }));

  service.isAuthenticated = function() {
    return service.client.isAuthenticated();
  };

  service.authenticate = function() {
    service.client.authenticate(function(error, client) {
      if (error) {
        alert(error);
        return false;
      }
      return true;
    });
  };

  service.getFiles = function() {
    return files;
  };

  service.getKanbans = function() {
    var deferred = $q.defer();
    if (service.client.isAuthenticated()) {
      service.client.readdir("/", function(error, entries) {
        if (error) {
          deferred.reject(error); // Something went wrong.
        }
        deferred.resolve(entries);
        $rootScope.$apply();
      });
    }
    return deferred.promise;
  }

  service.getCurrentKanban = function() {
    return service.currentKanban;
  }
  service.getKanbanFile = function(filename) {
    service.client.readFile(filename, function(error, data) {
      if (error) {
        return alert(error); // Something went wrong.
      }
      service.currentKanban = JSON.parse(data);
      $rootScope.$apply();
    });
  };

  service.save = function(filename, content) {
    service.client.writeFile(filename, content, function(error, stat) {
      if (error) {
        return alert(error); // Something went wrong.
      }

      alert("File saved as revision " + stat.revisionTag);
    });
  };

  return service;

});

//factory para integração com socket.io
// Demonstrate how to register services
// In this case it is a simple value service.
myApp.factory('socket', ['$rootScope', '$location', '$window', function ($rootScope, $location, $window) {
    var socket_io_address = 'http://' + $location.host() + ':3837';
    if($window.kanban_environment == 'production-heroku') {
      socket_io_address = 'http://kanban-websocket-server.herokuapp.com/';
    }
    var socket = io.connect(socket_io_address);
    return {
      onconnect: function(callback) {
        this.on('connect', callback);
      },
      ondisconnect: function(callback) {
        this.on('disconnect', callback);
      },
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  }]);


//serviço que inicializa um canal websocket para receber atualizações do kanban e para enviar notificações 
//de mudanças do kanban para o servidor
myApp.factory('kanbanRefreshService', ['$rootScope', '$location', function($rootScope, $location) {
    // We return this object to anything injecting our service
    var Service = {};
    // Keep all pending requests here until they get responses
    var serviceCallback = function(){};
    // Create a unique callback ID to map requests to responses
    var currentCallbackId = 0;
    // Create our websocket object with the address to the websocket
    var ws;

    
    function defineWs(kanban_id) {

      if(ws != null && ws != undefined) {
        ws.close();
      }

      //console.log("Conectando Websocket em: " + "ws://" + $location.host() +":" +  $location.port() + "/socket/kanban_tasks_refresh/" + kanban_id);
      ws = new WebSocket("ws://" + $location.host() +":" +  $location.port() + "/socket/kanban_tasks_refresh/" + kanban_id);

      ws.onopen = function(){  
         //console.log("Socket has been opened!");  
      };
      
      ws.onmessage = function(message) {
          listener(message.data);
      };

    }

    function sendRequest(request) {
        ws.send(JSON.stringify(request));
    };

   
    function listener(data) {
      $rootScope.$apply(serviceCallback(JSON.parse(data)));
    };
   

    //Inicializa o refresh service definindo o metódo de callback a ser chamado ao se receber mensagens do websocket
    Service.setup = function(kanban_id, callback) {
      defineWs(kanban_id);
      serviceCallback = callback;
    };

    //envia mensagem para os outros clientes websocket
    Service.sendMessage = function(requestMessage) {
      sendRequest(requestMessage);
    };

    return Service;
}]);

myApp.factory('gitlabService', function($rootScope, $q, $http){
  var service = {};
  var client_configuration = {
      service_url: 'https://gitlab.com/api/v3',
      private_token: ''
  }
  var header = {};

  service.currentUser = null;

  service.configure = function(service_url, private_token){
      client_configuration.service_url = service_url;
      client_configuration.private_token = private_token;
      if(private_token != null && private_token != undefined && private_token.length > 0){
        $http.defaults.headers.post = {
                'PRIVATE-TOKEN' : private_token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
        };
        $http.defaults.headers.get = {
                'PRIVATE-TOKEN' : private_token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
        };
      }
      else {
        $http.defaults.headers.post = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
        };
        $http.defaults.headers.get = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
        };
      }
  };

  service.checkAuthentication = function(){
    if (client_configuration.private_token.length > 0)
    {
      return false;
    }
    retun (this.currentUser != null);
  };

  service.login = function(login, password){
    //TODO check parameters
     var deferred = $q.defer();
     $http.post(client_configuration.service_url + '/session',
          {
            login: login,
            password: password
          }).success(function(data, status){
                service.currentUser = data;
                service.configure(client_configuration.service_url, data.private_token)
                deferred.resolve(data);                  
          }).error(function(data, status){
            deferred.reject(data);
          });
     return deferred.promise;
  }

  service.getProjects = function(){
     var deferred = $q.defer();
     $http.get(client_configuration.service_url + '/projects').
       success(function(data, status){
          deferred.resolve(data);
       }).
       error(function(error){
          deferred.reject(error);
       });
     return deferred.promise;
  };

  service.getIssues = function(project_id, per_page){
     var deferred = $q.defer();
     var url = client_configuration.service_url + '/projects/' + project_id + '/issues';
     if(per_page === null || per_page === undefined){
        url += '?per_page=200';
     }
      else {
        url += '?per_page=' + per_page;
      }
     $http.get(url).
      success(function(data, status){
          deferred.resolve(data);    
       }).
      error(function(data){
          deferred.reject(data);
      });
     return deferred.promise;
  };

  service.createIssue = function(project_id, title, description) {
    var deferred = $q.defer();
    var url = client_configuration.service_url + '/projects/' + project_id + '/issues';
    $http.post(url,
                  {
                    title: title,
                    description: description 
                  }
      ).
      success(function(data,status){
          deferred.resolve(data);
        }
      ).
      error(function(data, status){
        deferred.reject(data);
      });
    return deferred.promise;
  };

  service.getMilestones = function(project_id, per_page) {
    var deferred = $q.defer();
     var url = client_configuration.service_url + '/projects/' + project_id + '/milestones';
     if(per_page === null || per_page === 'undefined'){
        url += '?per_page=200';
     }
      else {
        url += '?per_page=' + per_page;
      }
     $http.get(url).
       success(function(data, status){
          deferred.resolve(data);    
       }).
       error(function(data, status){
          deferred.reject(data);
       });
     return deferred.promise;
  };

  return service;
});