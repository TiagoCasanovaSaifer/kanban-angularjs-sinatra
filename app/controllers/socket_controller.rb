class SocketController< KanbanWebApp::BaseController

set :sockets, {}
get '/kanban_tasks_refresh/:kanban_id' do |kanban_id|
    #incializa array de sockets para o referido kanban se ainda não foi inicializado
    settings.sockets[kanban_id] ||= []
    puts settings.sockets.keys.inspect 
    request.websocket do |ws|
      ws.onopen do
        settings.sockets[kanban_id] << ws
      end
      ws.onmessage do |msg|
        data = JSON.parse(msg)
        params["type"] ||= "status"
        if(params["type"] == "status")
         tasks = Project.find_by(name: data["project_name"]).kanbans.find(data["kanban_id"]).status.find(data["status_id"]).tasks
          refresh_data = data.merge(tasks: tasks)
        else
          task = Project.find_by(name: data["project_name"]).kanbans.find(data["kanban_id"]).status.find(data["status_id"]).tasks.find(params["task_id"])
          refresh_data = data.merge(tasks: task)
        end
        EM.next_tick { settings.sockets[kanban_id].each{|s| s.send(refresh_data.to_json) } }
      end
      ws.onclose do
        warn("wetbsocket closed")
        settings.sockets[kanban_id].delete(ws)
      end
    end
  end
end