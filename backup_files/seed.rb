# encoding: utf-8
require 'mongoid'
require 'mongoid/nested_serialization'
require './kanban.rb'
require 'json'


# script para carga inicial de dados do projeto kanban. 
# define projeto template, com colunas padronizadas para os kanbans
Mongoid.load!('mongoid.yaml')

Project.all.destroy

if (Project.where(name: 'default_template').count == 0)
  project = Project.create(name: 'default_template', type: 'kanban')

  kanban = project.kanbans.create(name: 'template')

  status_list = ['Planejando (Backlog)', 'Projetando', 'Em desenvolvimento', 'Testando', 'Entregue'].map do |status|
    kanban.status.create(name: status)
  end

    puts 'Template de Projeto criado.'

else
	puts 'Não foi necessário criar Template de Projeto pois ele já existe.'
end

puts Project.find_by(name: 'default_template').to_json(:include => {:status => {:include => :tasks}})

puts Project.find_by(name: 'default_template').kanbans.first.to_json(:include => {:status => {:include => :tasks}})