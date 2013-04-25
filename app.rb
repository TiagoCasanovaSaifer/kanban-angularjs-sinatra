require 'sinatra/base'
require 'sinatra/json'
require 'json'
require 'mongoid'
require './kanban.rb'

require "sinatra/reloader" #if development?


class MyApp < Sinatra::Base
   helpers Sinatra::JSON

set :port, 3838

Mongoid.load!('mongoid.yaml')
Mongoid.raise_not_found_error = false


before do
  content_type :json
end

get '/' do
    redirect '/index.html'
end

#TEMPLATES
get '/project_template' do
  Project.default_template.to_json(:include => {:status => {:include => :tasks}})
end

get '/kanban_template' do
  Project.default_template.kanbans[0].to_json(:except => ["_id", "tasks"], :include => {:status => {:include => :tasks}})
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
    task_attributes = JSON.parse(request.body.read.to_s)
    
    unless(params[:rearrange]) 
      kanban.tasks.find(task_id).update_attributes(task_attributes)
    else
      if "destination".eql?(params["target"])
        kanban.status.find(task_attributes["status_id"]).reArrange(task_id, task_attributes)
      else
        kanban.status.find(task_attributes["status_id"]).reArrangeOrigin(task_attributes)
      end
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

run! if app_file == $0
end
