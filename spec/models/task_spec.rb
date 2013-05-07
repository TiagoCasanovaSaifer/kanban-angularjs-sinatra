describe Task do
  before(:each) do
    Project.all.destroy
    Task.all.destroy
  end

  subject {Task.create(text: "")}

  it { Task.should validate_presence_of(:status_id) }
  it { Task.should validate_presence_of(:kanban_id) }
  it { Task.should validate_presence_of(:text) }
  
  describe "task creation" do
    let(:project) { Project.create!(name: "Novo projeto") }
    let(:kanban) { project.kanbans.create!(name: "Novo kanban") }
    let(:status) { kanban.status.create!(name: "A fazer") }

    
    it "auto increment sequence on creation" do
      task = kanban.tasks.create!(text: "Nova atividade", status_id: status.id) 
      task.seq.should_not be_nil
    end
  end
end