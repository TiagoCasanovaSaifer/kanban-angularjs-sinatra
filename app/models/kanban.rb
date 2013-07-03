class Kanban
  include Mongoid::Document
  field :name, type: String
  embedded_in :project
  embeds_many :status
  has_many :tasks

  validates_uniqueness_of :name
  validates_presence_of :name

  def to_json(options={})
    super(options.merge({:include => :tasks}))
  end
  
  def move_task(task, status_to, position_to)
    return if task.kanban_id != self.id   #only move tasks from this kanban
    return if status_to.kanban.id != self.id #only if the status_to is within this kanban
    #remove task from original status group
    status_from = status.find task.status_id
    status_from.tasks.delete task
    #assign new task sequential
    task.seq = position_to
    #push task to target status group
    status_to.tasks.push task
  end
end