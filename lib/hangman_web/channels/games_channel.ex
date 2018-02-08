defmodule HangmanWeb.GamesChannel do
  use HangmanWeb, :channel

  alias Hangman.Game

  def join("games:" <> name, payload, socket) do
    if authorized?(payload) do
      game = Hangman.GameBackup.load(name) || Game.new()
      socket = socket
      |> assign(:game, game)
      |> assign(:name, name)
      {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("guess", %{"letter" => ll}, socket) do
    game = Game.guess(socket.assigns[:game], ll)
    Hangman.GameBackup.save(socket.assigns[:name], game)
    socket = assign(socket, :game, game)
    {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end

