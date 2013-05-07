class Status
  include Mongoid::Document
  embedded_in :kanban
  field :name, type: String
  has_many :tasks,  :order => "seq ASC"

  validates_presence_of :name

  def self.default_status_set
      ['Planejando (Backlog)', 'Projetando', 'Em Desenvolvimento', 'Testando', 'Entregue']
  end

  def reArrange(task_id, task_attributes)
    #move a task alterada para o seu destino
    task = kanban.tasks.find(task_id)
    task.status = self
    #puts "DEST POSITION: #{task_attributes["destPosition"]}"
    #reordena as tasks posicionadas apos ela
    tasks.where(:seq.gte =>  task_attributes["destPosition"]).each do |t|
      #puts t.text
      t.seq = t.seq + 1;
      t.save
    end
     task.seq = task_attributes["destPosition"]
    task.save
  end

  def reArrangeOrigin(rearrange_attributes)
    #reordena as tasks posicionadas apos o elemento movido na sua lista de origem
    #puts "ORIGIN POSITION: #{rearrange_attributes["originPosition"]}"
    tasks.where(:seq.gt =>  rearrange_attributes["originPosition"]).each do |t|
          #puts t.text
          t.seq = t.seq - 1;
          t.save
        end
    end
end