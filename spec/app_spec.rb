require 'spec_helper'
require './kanban'


describe Project do
	before(:each) do
		Project.all.destroy
	end

	it { should validate_uniqueness_of(:name) }
	it { should validate_presence_of(:name) }

	it { should embed_many :kanbans }

	
	describe "#create" do
		it "add 1 more project" do
			expect {Project.create(name: 'one project more')}.to change{Project.count}.by(1)
		end
		it "assigns id to project created" do
			project = Project.create(name: 'project created')
			project.id.should_not be_nil 
		end
		it "not allow repeated project name" do
			Project.create!(name: "project_created")
			expect{Project.create!(name: "project_created")}.to raise_error(Mongoid::Errors::Validations)
		end
	end
end

describe Kanban do
	before(:each) do
		Project.all.destroy
	end

	subject { Project.create(name: "project1" )}

	it "creates a new kanban" do
		expect {subject.kanbans.create(name: "KANBAN 1")}.to change{subject.kanbans.count}.by(1)
	end

	it { Kanban.should validate_uniqueness_of(:name) }
	it { Kanban.should validate_presence_of(:name) }

	it "not allow repeated project names" do
			subject.kanbans.create!(name: "k1")
			subject.kanbans.new(name: "k1").save().should be_false
			expect{subject.kanbans.create!(name: "k1")}.to raise_error(Mongoid::Errors::Validations)
	end
end