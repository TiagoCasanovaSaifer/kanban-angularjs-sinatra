module KanbanWebApp
  class Application < Rack::URLMap
    def initialize
      super({
        '/' => RootController,
        '/socket' => SocketController
      })
    end
  end
end