#require não necessário pois está definido no arquivo .rspec
#require './spec/spec_helper' 
describe Project do
  before(:each) do
    Project.all.destroy
    Project.templates.destroy
  end

  it { should validate_uniqueness_of(:name) }
  it { should validate_presence_of(:name) }

  it { should embed_many :kanbans }

describe "templates" do
    before do
      Project.create!(name: "default_template", type: "template")
      Project.create!(name: "template1", type: "template")
      Project.create!(name: "template2", type: "template")
      Project.create!(name: "project1", type: "normal")
    end
    describe "#default_template" do
      it "get default template if exists" do
        Project.default_template.should_not be_nil
      end
    end
    describe "#templates" do
      it "returns only project templates" do
        Project.count.should eq(1)
        Project.templates.count.should eq(3)
      end
    end
end

describe "#create_kanban" do
  subject { Project.create!(name: "PROJECT for #create_kanban test") }
  let(:kanban_hash) do
    {"name" => "KANBAN for #create_kanban test" }
  end
    it { subject.create_kanban(kanban_hash).id.should_not be_nil }
end

  describe "#create" do
    it "add 1 more project" do
      expect {Project.create!(name: 'one project more')}.to change{Project.count}.by(1)
    end
    it "assigns id to project created" do
      project = Project.create!(name: 'project created')
      project.id.should_not be_nil
    end
    it "not allow repeated project name" do
      Project.create!(name: "project_created")
      expect{Project.create!(name: "project_created")}.to raise_error(Mongoid::Errors::Validations)
    end
  end
end