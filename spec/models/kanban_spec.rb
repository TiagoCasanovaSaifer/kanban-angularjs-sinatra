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
    it "include tasks" do
      kanban.to_json.should =~ /tasks/
      kanban.to_json.should =~ /text/
    end
  end
end