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
        gap: "20px",
        marginBottom: "24px",
      }}
    >
      {game.players.map((player) => (

        <div
          key={player.id}
          style={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "12px",
            padding: "16px",
            width: "220px",
          }}
        >

          <h3>
            {player.name}
          </h3>

          <div>
            Guild: {player.guild ?? "None"}
          </div>

          <div>
            VP: {player.vp}
          </div>

          <hr />

          <div>
            🧱 {player.resources.brick}
            {" "}
            🌲 {player.resources.lumber}
            {" "}
            🌾 {player.resources.wheat}
          </div>

          <div>
            🐑 {player.resources.sheep}
            {" "}
            ⛰️ {player.resources.ore}
          </div>

          <div>
            🏠 Settlements: {player.settlements.length}
          </div>

        </div>

      ))}
    </div>
  );
}

export default PlayerPanel;