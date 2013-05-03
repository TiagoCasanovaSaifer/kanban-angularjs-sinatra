class Task
  include Mongoid::Document
  belongs_to :kanban
  belongs_to :status
  field :text, type: String
  field :seq, type: Integer

  validates_presence_of :kanban_id, :status_id#, :text, :seq

  before_create :assign_sequence

  protected

  def assign_sequence
    status =  self.kanban.status.find(self.status_id)
    #puts status
    #puts status.tasks.count
    self.seq = status.tasks.count
  end
end

#referencia de projetos uteis Mongoid
#https://github.com/80beans/mongoid-autoinc