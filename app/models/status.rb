class Status
  include Mongoid::Document
  embedded_in :kanban
  field :name, type: String
  has_many :tasks,  :order => "seq ASC", :before_add => :before_add_task, :after_remove => :after_remove_task

  validates_presence_of :name

  def self.default_status_set
      ['Planejando (Backlog)', 'Projetando', 'Em Desenvolvimento', 'Testando', 'Entregue']
  end


  def before_add_task(task_added)
    tasks.where(:seq.gte => task_added.seq).each do |t|
      t.seq = t.seq + 1;
      t.save
    end
  end

  def after_remove_task(task_removed)
    tasks.where(:seq.gt => task_removed.seq).each do |t|
      t.seq = t.seq - 1;
      t.save
    end
  end
end