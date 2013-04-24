ActiveSupport::Inflector.inflections do |inflect|
  inflect.uncountable "status"
end

class Project
  include Mongoid::Document
  field :name, type: String
  field :type, type: String, :default => 'project'
  embeds_many :kanbans

  def self.default_template
    self.find_by(name: 'default_template')
  end

  def self.templates
    self.find_by(type: 'template')
  end

  def create_kanban(kanban)
    novo_kanban = self.kanbans.new(name: kanban["name"])
    unless (kanban["status"])
      Status.default_status_set.each do |status_name|
        novo_kanban.status .new(name: status_name)
      end
    end
    self.save!
    novo_kanban
  end
end

class Kanban
  include Mongoid::Document
  field :name, type: String
  embedded_in :Project
  embeds_many :status
  has_many :tasks
  def to_json(options={})
    super(options.merge({:include => :tasks}))
  end
end

class Status
  include Mongoid::Document
  embedded_in :kanban
  field :name, type: String
  has_many :tasks

  def self.default_status_set
      ['Planejando (Backlog)', 'Projetando', 'Em Desenvolvimento', 'Testando', 'Entregue']
  end
end

class Task
  include Mongoid::Document
  belongs_to :kanban
  belongs_to :status
  field :text, type: String
end