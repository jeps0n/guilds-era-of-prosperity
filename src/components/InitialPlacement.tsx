import type { GameState } from "../game/engine/GameState";

interface InitialPlacementProps {
  game: GameState;
  onPlaceSettlement: () => void;
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

  const totalPlacements = game.placementOrder.length;
  const progress = Math.min(
    game.placementStep + 1,
    totalPlacements
  );

  return (
    <div
      style={{
        padding: "24px",
        background: "#111827",
        color: "white",
        borderRadius: "16px",
        textAlign: "center",
      }}
    >
      <h2>🏘️ Initial Settlement Placement</h2>

      <h3>
        {currentPlayer.name}'s Turn
      </h3>

      <p>
        Placement:
        {" "}
        {progress} / {totalPlacements}
      </p>

      <button onClick={onPlaceSettlement}>
        Place Settlement
      </button>
    </div>
  );
}

export default InitialPlacement;