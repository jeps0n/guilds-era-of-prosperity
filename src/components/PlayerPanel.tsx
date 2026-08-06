import type { GameState } from "../game/engine/GameState";
import Panel from "./ui/Panel";

interface PlayerPanelProps {
  game: GameState;
}

function PlayerPanel({
  game,
}: PlayerPanelProps) {

  return (
    <div
      style={{
        marginTop: "14px",
      }}
    >

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    width: "100%",
  }}
>

        {game.players.map((player) => (

            <Panel>

            <strong>
              {player.name}
            </strong>


            <div style={{ marginTop: "6px" }}>
              Guild: {player.guild ?? "None"}
            </div>


            <div>
              VP: {player.vp}
            </div>


            <hr
              style={{
                margin: "8px 0",
                borderColor: "#374151",
              }}
            />


            <div>
              🧱 {player.resources.brick}{" "}
              🌲 {player.resources.lumber}
            </div>


            <div>
              🌾 {player.resources.wheat}{" "}
              🐑 {player.resources.sheep}
            </div>


            <div>
              ⛰️ {player.resources.ore}
            </div>


            <div
              style={{
                marginTop: "8px",
              }}
            >
              🏠 {player.settlements.length}
            </div>

          </Panel>

        ))}

      </div>

    </div>
  );
}

export default PlayerPanel;