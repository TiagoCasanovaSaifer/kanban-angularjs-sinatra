source 'https://rubygems.org'
source 'http://gemcutter.org'

gem 'mongoid'
gem "mongoid-nested-serialization"
gem 'mongoid-autoinc', "~>0.3.0"

#gem "yajl-ruby", "~> 1.1.0"
gem 'sinatra'
gem 'sinatra-contrib'

platforms :ruby do
	gem 'thin'
end

platforms :jruby do
	gem 'trinidad'
end

group :development do
  gem 'capistrano',         '~> 2.15', :require => nil
  gem 'capistrano-ext',     '~> 1.2.1', :require => nil
  gem 'capistrano_colors',  '~> 0.5.3', :require => nil
  gem 'rvm-capistrano'
  gem 'cap-recipes' #https://github.com/nesquena/cap-recipes
end
