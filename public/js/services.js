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