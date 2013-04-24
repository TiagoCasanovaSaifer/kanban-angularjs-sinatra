# encoding: utf-8
require 'mongoid'
require 'mongoid/nested_serialization'
require './kanban.rb'
require 'json'

ENV['MONGOID_ENV'] = 'test'

# script para carga inicial de dados do projeto kanban. 
# define projeto template, com colunas padronizadas para os kanbans
Mongoid.load!('mongoid.yaml')

Project.all.destroy
#Kanban.all.destroy
#Status.all.destroy
#Task.all.destroy

project = Project.create(name: 'test', type: 'kanban')

kanban = project.kanbans.create(name: 'kanban-test')


status_list = ['Planejando (Backlog)', 'Projetando', 'Em desenvolvimento', 'Testando', 'Entregue'].map do |status|
	kanban.status.create(name: status)
end

kanban.tasks.create(text: "Atividade 1", status: status_list[0])
kanban.tasks.create(text: "Atividade 2", status: status_list[1])
kanban.tasks.create(text: "Atividade 3", status: status_list[2])
kanban.tasks .create(text: "Atividade 4", status: status_list[3])

reloaded_project = Project.find_by(name: 'test')

#puts reloaded_project.to_json(:include => {:kanbans => {:include => {:status => {:include => :tasks}}}})
puts reloaded_project.to_json(include: {:kanbans => {include: :tasks}})

#puts reloaded_project.kanbans.first.to_json

#puts reloaded_project.kanbans.first.status.to_json

#reloaded_project.kanbans.first.status.each do  |status|
#	puts status.tasks.to_json
#end