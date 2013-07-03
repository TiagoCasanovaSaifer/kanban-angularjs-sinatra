require 'rspec'

# encoding: utf-8
require 'mongoid'
require 'mongoid/nested_serialization'
require './kaneban.rb'

# script para carga inicial de dados do projeto kanban. 
# define projeto template, com colunas padronizadas para os kanbans
Mongoid.load!('mongoid.yaml')

#class AppTest




