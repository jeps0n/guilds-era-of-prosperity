import type { GameState } from "../game/engine/GameState";
interface GameStatusProps {
  game: GameState;
  onEndTurn: () => void;
  onRestoreCheckpoint: () => void;
  canRestoreCheckpoint: boolean;
}
function GameStatus({
  game,
  onEndTurn,
  onRestoreCheckpoint,
  canRestoreCheckpoint,
}: GameStatusProps) {
  const currentPlayer =
    game.players.find(
      (player) =>
        player.id ===
        game.currentPlayerId
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
        {currentPlayer?.name ??
          "Unknown"}
      </div>
      <button
        onClick={
          onRestoreCheckpoint
        }
        disabled={
          !canRestoreCheckpoint
        }
        style={{
          marginTop: "12px",
          marginRight: "8px",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          background:
            canRestoreCheckpoint
              ? "#4b5563"
              : "#1f2937",
          color:
            canRestoreCheckpoint
              ? "white"
              : "#6b7280",
          cursor:
            canRestoreCheckpoint
              ? "pointer"
              : "not-allowed",
          fontWeight: "bold",
        }}
      >
        Restore Checkpoint
      </button>
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