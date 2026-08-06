import type { GameState } from "../game/engine/GameState";
import GameBoard from "./GameBoard";

interface InitialPlacementProps {
  game: GameState;
  onPlaceSettlement: (location: string) => void;
}

function InitialPlacement({
  game,
  onPlaceSettlement,
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
        {currentPlayer.name}, choose a settlement location
      </h3>

      <p>Board placement coming next...</p>
      
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