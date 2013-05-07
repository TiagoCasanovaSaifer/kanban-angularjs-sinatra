describe Status do
  before do
    Project.all.destroy
  end

  it { should validate_presence_of(:name) }
  it { should be_embedded_in(:kanban) }
  it { should have_many(:tasks) }

  describe ".default_status_set" do
    it "returns an array containing a default set of statuses" do
      Status.default_status_set.class.should == Array
    end

    it "is this set ['Planejando (Backlog)', 'Projetando', 'Em Desenvolvimento', 'Testando', 'Entregue']" do
      Status.default_status_set.should == ['Planejando (Backlog)', 'Projetando', 'Em Desenvolvimento', 'Testando', 'Entregue']
    end

  end

  describe "reArrange" do
    let(:project) { Project.create!(name: "PROJECT for #reArrange test") }
    let(:kanban) { project.kanbans.create!(name: "KANBAN for #reArrange test") }
    let(:status_planning) { kanban.status.create!(name: "Planning") }
    let(:status_doing) { kanban.status.create!(name: "Doing") }
    let(:planning_tasks) do
      tasks = []
      tasks << kanban.tasks.create!(text: "Task1", status_id: status_planning.id)
      tasks << kanban.tasks.create!(text: "Task2", status_id: status_planning.id)
      tasks << kanban.tasks.create!(text: "Task3", status_id: status_planning.id)
      tasks << kanban.tasks.create!(text: "Task4", status_id: status_planning.id)
      tasks
   end

   let(:doing_tasks) do
      tasks = []
      tasks << kanban.tasks.create!(text: "Task5", status_id: status_doing.id)
      tasks << kanban.tasks.create!(text: "Task6", status_id: status_doing.id)
      tasks << kanban.tasks.create!(text: "Task7", status_id: status_doing.id)
      tasks << kanban.tasks.create!(text: "Task8", status_id: status_doing.id)
      tasks
   end

   before do
    planning_tasks
    doing_tasks
  end

   let(:status_doing_tasks_rearranged) do
    status_doing.reArrange(planning_tasks[0].id,  {"destPosition" => 2})
    status_doing.tasks.map {|task| task.text}
   end

   let(:status_planning_rearranged) do
    status_planning.reArrangeOrigin({"originPosition" => 0})
    status_planning.tasks
   end

    it "moves a task to another status" do 
      expect(status_doing_tasks_rearranged).to eq(["Task5", "Task6", "Task1", "Task7", "Task8"])
      expect(status_planning_rearranged.map {|task| task.seq}).to eq([0,1,2])
      expect(status_planning_rearranged.map {|task| task.text}).to eq(["Task2","Task3","Task4"])
    end
  end
end