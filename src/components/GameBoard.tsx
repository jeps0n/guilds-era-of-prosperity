import type { GameState } from "../game/engine/GameState";

interface GameBoardProps {
  game: GameState;
  onSelectLocation: (location: string) => void;
}

const locations = [
  "Forest",
  "Mountain",
  "River",
  "Plains",
  "Coast",
];

function GameBoard({
  game,
  onSelectLocation,
}: GameBoardProps) {
  const occupiedLocations =
    game.players.flatMap((player) =>
      player.settlements.map(
        (settlement) => settlement.location
      )
    );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 140px)",
        gap: "16px",
        marginTop: "24px",
      }}
    >
      {locations.map((location) => {
        const occupied =
          occupiedLocations.includes(location);

        return (
          <button
            key={location}
            disabled={occupied}
            onClick={() =>
              onSelectLocation(location)
            }
            style={{
              height: "100px",
              background: occupied
                ? "#374151"
                : "#22c55e",
              color: "white",
              borderRadius: "12px",
              cursor: occupied
                ? "not-allowed"
                : "pointer",
            }}
          >
            {occupied ? "🏠" : "📍"}
            <br />
            {location}
          </button>
        );
      })}
    </div>
  );
}

export default GameBoard;