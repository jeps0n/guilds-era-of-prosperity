import type { GameState } from "../game/engine/GameState";

interface InitialPlacementProps {
  game: GameState;
    onPlaceSettlement: (location: string) => void;
}

const locations = [
  "Forest",
  "Mountain",
  "River",
  "Plains",
  "Coast",
];

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 120px)",
          gap: "12px",
        }}
      >
        {locations.map((location) => (
          <button
            key={location}
            onClick={() => onPlaceSettlement(location)}
            style={{
              height: "80px",
              cursor: "pointer",
            }}
          >
            📍
            <br />
            {location}
          </button>
        ))}
      </div>

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