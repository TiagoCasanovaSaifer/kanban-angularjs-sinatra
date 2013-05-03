class Project
  include Mongoid::Document
  field :name, type: String
  field :type, type: String, :default => 'project'
  embeds_many :kanbans

  validates_uniqueness_of :name
  validates_presence_of :name

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