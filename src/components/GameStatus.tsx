import type { GameState } from "../game/engine/GameState";
interface GameStatusProps {
  game: GameState;
  onRestoreCheckpoint: () => void;
  canRestoreCheckpoint: boolean;
}
function GameStatus({
  game,
  onRestoreCheckpoint,
  canRestoreCheckpoint,
}: GameStatusProps) {
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: "12px",
        padding: "12px 20px",
        minWidth: "280px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <strong>Phase:</strong>{" "}
          {game.phase}
        </div>
        <div style={{ textAlign: "right" }}>
          <strong>Turn:</strong>{" "}
          {game.turnNumber}
        </div>
      </div>
      <button
        type="button"
        onClick={onRestoreCheckpoint}
        disabled={!canRestoreCheckpoint}
        style={{
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
        Turn Back
      </button>
    </div>
  );
}
export default GameStatus;