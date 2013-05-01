var fs = require("fs");
var env = JSON.parse(fs.readFileSync("bridge.json").toString());
var io = require("socket.io").listen(env.stream_port, "0.0.0.0");
var http = require("http");

io.configure(function () { 
  io.set("transports", ["websocket","xhr-polling"]); 
  io.set("polling duration", 10);
});

io.sockets.on('connection', function(sock) {
  console.log('new client connected');

  sock.on('registerToKanbanChannel', function(data){
    var kanban_room = data.kanban_id;
    sock.room = kanban_room;
    sock.join(kanban_room);
  });

 

  sock.on('disconnect', function(){
    console.log('disconnect');
    sock.leave(sock.room);
  });

  sock.on('kanban-refresh', function(data){
     console.log(data);
      sock.broadcast.to(data.kanban_id).emit('kanban-refresh', data);
  });
});

