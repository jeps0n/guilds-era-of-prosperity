import type { GameEvent } from "../game/engine/GameState";
interface GameLogProps {
  events: GameEvent[];
}
function GameLog({
  events,
}: GameLogProps) {
  return (
    <div
      style={{
        background: "#111827",
        color: "white",
        borderRadius: "12px",
        padding: "12px",
        width: "260px",
        height: "300px",
        overflowY: "auto",
        boxShadow:
          "0 8px 20px rgba(0,0,0,0.25)",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "10px",
          fontSize: "16px",
        }}
      >
        Game Events
      </h3>
      {events.length === 0 ? (
        <div
          style={{
            opacity: 0.6,
            fontSize: "14px",
          }}
        >
          No events yet.
        </div>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            style={{
              fontSize: "13px",
              marginBottom: "8px",
              paddingBottom: "8px",
              borderBottom:
                "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {event.message}
          </div>
        ))
      )}
    </div>
  );
}
export default GameLog;