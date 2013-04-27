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
          reArrange: {method: 'POST', params: {rearrange: true, target: 'destination'}},
          reArrangeOrigin: {method: 'POST', params: {rearrange: true, target: 'origin'}},
        });
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