class RootController < KanbanWebApp::BaseController
  mount_assets

  get '/' do
    content_type 'text/html', :charset => 'utf-8'
    erb :index
  end

  get '/index.html' do
    content_type 'text/html', :charset => 'utf-8'
    erb :index
  end

  # get '/' do
  # 	redirect 'index.html'
  # end

  #set :port, BRIDGE["rack_port"] unless ARGV["-p"]

  #TEMPLATES
  get '/project_template' do
    Project.default_template.to_json(:include => {:status => {:include => :tasks}})
  end

  get '/kanban_template' do
    if(Project.default_template)
    Project.default_template.kanbans[0].to_json(:except => ["_id", "tasks"], :include => {:status => {:include => :tasks}})
  else
    {}.to_json
  end
  end

  #PROJECT OPERATIONS
  #list all projects
  get '/project' do
    projects = Project.all.reject {|p| p.name == 'default_template'}
    projects.to_json({:only => [:_id, :name]})
  end

  #create project
  post '/project' do
    project_sent = JSON.parse(request.body.read.to_s)
    project = Project.create(project_sent)
    project.to_json
  end


  #get project by name
  get '/project/:name' do |name|
    raise name
    project = Project.find_by(name: name)
    if(project)
      project.to_json({include: :tasks})
    else
      error 404, 'project not found'
    end
  end

  put '/project' do
    project_sent = JSON.parse(request.body.read.to_s)
    project = Project.find(project_sent["_id"])

    if(project)
      project.update_attributes(project_sent)
      'project sucessfully updated'
    else
      error 404, 'project not found'
    end
  end

  #delete project by name
  delete '/project/:name' do |name|
    project = Project.where(name: name)
    if(project)
      project.destroy
      'project successfully deleted'
    else
      error 404, 'project not found'
    end
  end

  #COMMON OPERATIOS
  get '/default_statuses' do
    Project.default_template.kanbans[0].statuses.to_json(only: :name)
  end
  #KANBAN OPERATIONS
  #list kanbans of a project
  get '/project/:name/kanban' do |project_name|
    project = Project.find_by(name: project_name)
    if(project)
      json project.kanbans
    else
      error 404, 'project not found'
    end
  end

  #get kanban for a project by the kanban id
  get '/project/:name/kanban/:kanban_id' do |project_name, kanban_id|
    project = Project.find_by(name: project_name)
    if(project)
      project.kanbans.find(kanban_id).as_json(:exclude => :tasks, :include => {:status => {:include => :tasks}}).to_json
    else
      error 404, 'project not found'
    end
  end
  #add a new kanban to a project
  post '/project/:name/kanban' do |project_name|
    project = Project.find_by(name: project_name)
    if(project)
      kanban_sent = JSON.parse(request.body.read.to_s)
      json project.create_kanban(kanban_sent)
    else
      error 404, 'project not found'
    end
  end

  get  '/project/:name/:kanban_id/tasks' do |project_name, kanban_id|
    project = Project.where(name: project_name)
    if(project && kanban=project.kanbans.find(kanban_id))
      kanban.tasks.asc(:seq).to_json
    else
      error 404, 'project/kanban not found'
    end
  end

  get '/project/:name/kanban/:kanban_id/status/:status_id/tasks' do |project_name, kanban_id, status_id|
    project = Project.find_by(name: project_name)
    if(project && kanban=project.kanbans.find(kanban_id))
      if(status=kanban.status.find(status_id))
        status.tasks.asc(:seq).to_json 
      else
         error 404, 'project/kanban/status not found'
      end
    else
      error 404, 'project/kanban/status not found'
    end
  end

  delete '/project/:name/kanban/:kanban_id/task/:task_id' do |project_name, kanban_id, task_id|
    project = Project.find_by(name: project_name)
    if(project && kanban=project.kanbans.find(kanban_id))
      kanban.tasks.find(task_id).destroy
      {result: 'ok'}.to_json
    else
      error 404, 'project/kanban not found'
    end
  end

  post '/project/:name/kanban/:kanban_id/task/:task_id' do |project_name, kanban_id, task_id|
    project = Project.find_by(name: project_name)
    if(project && kanban=project.kanbans.find(kanban_id))
      data = JSON.parse(request.body.read.to_s)

      unless(params[:move]) 
        kanban.tasks.find(task_id).update_attributes(data)
      else
        status_to= kanban.status.find(data["status_id"])
        task = kanban.tasks.find(data["id"])
        position_to = data["position"]
        kanban.move_task(task, status_to, position_to)
      end

      {result: 'ok'}.to_json
    else
      error 404, 'project/kanban not found'
    end
  end

  post '/project/:name/kanban/:kanban_id/task' do |project_name, kanban_id|
    project = Project.find_by(name: project_name)
    if(project)
      kanban = project.kanbans.find(kanban_id)
      if(kanban)
        task = JSON.parse(request.body.read.to_s)
        new_task = kanban.tasks.create(task)
        new_task.to_json
      else
        error 404, 'kanban not found'
      end

    else
      error 404, 'project not found'
    end
  end

  #SHOW ROUTES
  get '/named_via_params/:argument' do
      "
  Using: '/named_via_params/:argument'<br/>
  params[:argument] -> #{params[:argument]} (Try changing it)
  "
    end

    get '/named_via_block_parameter/:argument' do |argument|
      "
  Using: '/named_via_block_parameter/:argument'<br/>
  argument -> #{argument}
    "
    end

    get '/splat/*/bar/*' do
      "
  Using: '/splat/*/bar/*'<br/>
  params[:splat] -> #{params[:splat].join(', ')}
  "
    end

    get '/splat_extension/*.*' do
      "
  Using: '/splat_extension/*.*'<br/>
  filename -> #{params[:splat][0]}<br/>
  extension -> #{params[:splat][1]}
  "
    end

    get %r{/regexp_params_captures/([\w]+)} do
      "params[:captures].first -> '#{params[:captures].first}'"
    end

    get %r{/regexp_captures_via_block_parameter/([\w]+)} do |c|
      "c -> '#{c}'"
    end
end