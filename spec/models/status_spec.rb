describe Status do
  before do
    Project.all.destroy
  end

  it { should validate_presence_of(:name) }
  it { should be_embedded_in(:kanban) }
  it { should have_many(:tasks) }
  describe  ".default_status_set" do
    it "returns an array containing a default set of statuses" do
      Status.default_status_set.class.should == Array
    end

    it "is this set ['Planejando (Backlog)', 'Projetando', 'Em Desenvolvimento', 'Testando', 'Entregue']" do
      Status.default_status_set.should == ['Planejando (Backlog)', 'Projetando', 'Em Desenvolvimento', 'Testando', 'Entregue']
    end

  end
end
