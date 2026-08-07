import type { GameState } from "../game/engine/GameState";
interface GameStatusProps {
  game: GameState;
  onEndTurn: () => void;
}
function GameStatus({
  game,
  onEndTurn,
}: GameStatusProps) {
  const currentPlayer =
    game.players.find(
      (player) =>
        player.id === game.currentPlayerId
    );
  return (
    <div
      style={{
        marginTop: "12px",
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: "12px",
        padding: "12px 20px",
        minWidth: "280px",
        textAlign: "center",
      }}
    >
      <div>
        <strong>Phase:</strong>{" "}
        {game.phase}
      </div>
      <div>
        <strong>Turn:</strong>{" "}
        {game.turnNumber}
      </div>
      <div>
        <strong>Current Player:</strong>{" "}
        {currentPlayer?.name ?? "Unknown"}
      </div>
      {game.phase === "playing" && (
        <button
          onClick={onEndTurn}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          End Turn
        </button>
      )}
    </div>
  );
}
export default GameStatus;