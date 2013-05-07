describe KanbanWebApp do
  it "returns application root path " do
    KanbanWebApp.root.to_s.end_with?("/kanban-server").should be_true
  end

  it "returns environment variable" do
    expect(KanbanWebApp.environment.to_s).to eq("test")
  end

  it "returns compiled path" do
    root_path = KanbanWebApp.root.to_s
    expect(KanbanWebApp.compiled_path.to_s).to eq("#{root_path}/compiled")
  end

end