
class Project
	include Mongoid::Document
	field :name, type: String
	field :type, type: String, :default => 'project'
	has_many :kanbans

	def self.default_template
		self.find_by(name: 'default_template')
	end

	def self.templates
		self.find_by(type: 'template')
	end
end

class Kanban
  include Mongoid::Document
  field :name, type: String
  belongs_to :project
  has_many :status
  has_many :tasks
  def to_json(options={})
    super(options.merge({:include => :tasks}))
  end
end

class Status
	include Mongoid::Document
	belongs_to :kanban
	field :name, type: String
	has_many :tasks
end

class Task
	include Mongoid::Document
	belongs_to :kanban
	belongs_to :status
	field :text, type: String
end