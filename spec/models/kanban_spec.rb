describe Kanban do
  before(:each) do
    Project.all.destroy
    Task.all.destroy
  end

  subject { Project.create(name: "project1" )}

  it "creates a new kanban" do
    expect {subject.kanbans.create(name: "KANBAN 1")}.to change{subject.kanbans.count}.by(1)
  end

  it { Kanban.should validate_uniqueness_of(:name) }
  it { Kanban.should validate_presence_of(:name) }

  it "not allow repeated kanban names" do
      subject.kanbans.create!(name: "k1")
      subject.kanbans.new(name: "k1").save().should be_false
      expect{subject.kanbans.create!(name: "k1")}.to raise_error(Mongoid::Errors::Validations)
  end

  describe "to_json" do
    let(:kanban) do
      project = Project.create!(name: "project1" )
      kanban = project.kanbans.create!(name: "kanban1") 
      status = kanban.status.create!(name: "planning")
      kanban.tasks.create!(text: "text", status_id: status.id)
      kanban
    end
    it "should include tasks" do
      kanban.to_json.should =~ /tasks/
      kanban.to_json.should =~ /text/
    end
  end

  describe "move_task" do
    let!(:project) { Project.create!(name: "PROJECT for #reArrange test") }
    let!(:kanban) { project.kanbans.create!(name: "KANBAN for #reArrange test") }
    let!(:status_planning) { kanban.status.create!(name: "Planning") }
    let!(:status_doing) { kanban.status.create!(name: "Doing") }
    let!(:planning_tasks) do
      tasks = []
      tasks << kanban.tasks.create!(text: "Task1", status_id: status_planning.id)
      tasks << kanban.tasks.create!(text: "Task2", status_id: status_planning.id)
      tasks << kanban.tasks.create!(text: "Task3", status_id: status_planning.id)
      tasks << kanban.tasks.create!(text: "Task4", status_id: status_planning.id)
      tasks
    end

    let!(:doing_tasks) do
      tasks = []
      tasks << kanban.tasks.create!(text: "Task5", status_id: status_doing.id)
      tasks << kanban.tasks.create!(text: "Task6", status_id: status_doing.id)
      tasks << kanban.tasks.create!(text: "Task7", status_id: status_doing.id)
      tasks << kanban.tasks.create!(text: "Task8", status_id: status_doing.id)
      tasks
    end

    let(:kanban_rearranged) do
      kanban.move_task(planning_tasks[1], status_doing, 1)
      kanban
    end

    let(:planning_tasks_rearranged) do
      kanban_rearranged.status.find(status_planning.id).tasks
    end

    let(:doing_tasks_rearranged) do
      kanban_rearranged.status.find(status_doing.id).tasks
    end


    it "change tasks from one group status to another" do
      expect(planning_tasks_rearranged.map {|t| t.seq}).to eq([0,1,2])
      expect(planning_tasks_rearranged.map {|t| t.text}).to eq(['Task1', 'Task3', 'Task4'])

      expect(doing_tasks_rearranged.map {|t| t.seq}).to eq([0,1,2,3,4])
      expect(doing_tasks_rearranged.map {|t| t.text}).to eq(['Task5', 'Task2', 'Task6', 'Task7', 'Task8'])
    end
  end
end