import type { GameState } from "../game/engine/GameState";

interface PlayerPanelProps {
  game: GameState;
}

function PlayerPanel({
  game,
}: PlayerPanelProps) {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "12px",
      }}
    >
      {game.players.map((player) => (

        <div
          key={player.id}
          style={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "12px",
            padding: "10px",
            width: "185px",
            minHeight: "145px",
            boxSizing: "border-box",
          }}
        >

          <h3
            style={{
              margin: "0 0 6px 0",
              fontSize: "17px",
            }}
          >
            {player.name}
          </h3>

          <div>
            <strong>Guild:</strong>{" "}
            {player.guild ?? "None"}
          </div>

          <div style={{ marginTop: "2px" }}>
            <strong>VP:</strong>{" "}
            {player.vp}
          </div>

          <hr
            style={{
              margin: "8px 0",
              borderColor: "#374151",
            }}
          />

          <div>
            🧱 {player.resources.brick}{" "}
            🌲 {player.resources.lumber}{" "}
            🌾 {player.resources.wheat}
          </div>

          <div style={{ marginTop: "2px" }}>
            🐑 {player.resources.sheep}{" "}
            ⛰️ {player.resources.ore}
          </div>

          <div style={{ marginTop: "8px" }}>
            🏠 {player.settlements.length} Settlement
            {player.settlements.length !== 1 ? "s" : ""}
          </div>

        </div>

      ))}
    </div>
  );
}

export default PlayerPanel;