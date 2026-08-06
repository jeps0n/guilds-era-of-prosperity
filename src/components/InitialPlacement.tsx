import type { GameState } from "../game/engine/GameState";
import BoardView from "./BoardView";

interface InitialPlacementProps {
  game: GameState;
  onPlaceSettlement: (nodeId: string) => void;
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
        {currentPlayer.name}, choose a settlement node
      </h3>

      <BoardView
        board={game.board}
        settlements={game.players.flatMap(
          (player) => player.settlements
        )}
        onSelectNode={onPlaceSettlement}
      />

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