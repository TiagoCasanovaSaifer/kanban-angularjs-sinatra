class Kanban
  include Mongoid::Document
  field :name, type: String
  embedded_in :Project
  embeds_many :status
  has_many :tasks

  validates_uniqueness_of :name
  validates_presence_of :name

  def to_json(options={})
    super(options.merge({:include => :tasks}))
  end
end