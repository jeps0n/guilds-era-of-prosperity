import type { GameState } from "../game/engine/GameState";

interface InitialPlacementProps {
  game: GameState;
}

function InitialPlacement({
  game,
}: InitialPlacementProps) {
  const currentPlayer = game.players.find(
    (player) => player.id === game.currentPlayerId
  );

  if (!currentPlayer) {
    return null;
  }

  return (
    <div>
      <h2>🏘️ Initial Placement</h2>

      <h3>
        {currentPlayer.name}, choose a settlement node
      </h3>
      <p>
        Placement:
        {" "}
        {game.placementStep + 1}
        /
        {game.placementOrder.length}
      </p>
    </div>
  );
}

export default InitialPlacement;