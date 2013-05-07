$LOAD_PATH << File.dirname(__FILE__)

require 'rubygems'
require 'bundler/setup'

if ENV['RACK_ENV'] == 'test'
  require 'rack/test'
end

require 'sinatra'
require 'sinatra/url_for'
  require 'sinatra-websocket'
require 'json'

require 'coffee-script'
require 'mongoid'

require 'lib/kanban_web_app'
require 'app/controllers/base_controller'
[
  'lib', 'app', 'app/controllers', 'app/models', 'app/config/initializers'
].each do |folder|
  Dir["#{folder}/*.rb"].each {|file| require file }
end

require "app/config/app_config"
require "app/config/#{KanbanWebApp.environment}"
require 'app/application'