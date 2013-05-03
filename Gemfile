source 'https://rubygems.org'
source 'http://gemcutter.org'

ruby "1.9.3"

gem 'rake'
gem 'rack'

gem 'mongoid'
gem "mongoid-nested-serialization"
gem 'mongoid-autoinc', "~>0.3.0"

#gem "yajl-ruby", "~> 1.1.0"
gem 'sinatra'
gem 'sinatra-contrib'
gem 'sinatra-websocket'
gem 'emk-sinatra-url-for'
gem 'sinatra-asset-snack'

gem 'foreman'

gem 'therubyracer'
gem 'coffee-script'

platforms :ruby do
  gem 'thin'
end

group :development do
  gem 'capistrano',         '~> 2.15', :require => nil
  gem 'capistrano-ext',     '~> 1.2.1', :require => nil
  gem 'capistrano_colors',  '~> 0.5.3', :require => nil
  gem 'rvm-capistrano'
  gem 'cap-recipes' #https://github.com/nesquena/cap-recipes
  gem 'warbler'#, :git => "https://github.com/jruby/warbler.git"

end

platforms :jruby do
  #gem 'trinidad'
end

group :test do
  gem'rspec'
  gem 'mongoid-rspec'
  gem 'jasmine'
  gem "guard-jasmine", "~> 1.15.1"
  gem 'rack-asset-compiler'
end

