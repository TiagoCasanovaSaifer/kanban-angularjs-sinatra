ActiveSupport::Inflector.inflections do |inflect|
  inflect.uncountable "status"
end

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

class Status
  include Mongoid::Document
  embedded_in :kanban
  field :name, type: String
  has_many :tasks,  :order => "seq ASC"

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

class Task
  include Mongoid::Document
  belongs_to :kanban
  belongs_to :status
  field :text, type: String
  field :seq, type: Integer

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
