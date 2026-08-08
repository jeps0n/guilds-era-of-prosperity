import type { GameState } from "../game/engine/GameState";
import Panel from "./ui/Panel";
interface PlayerPanelProps {
  game: GameState;
}
function PlayerPanel({
  game,
}: PlayerPanelProps) {
  return (
    <div style={{ marginTop: "14px" }}>
      <div style={{ marginBottom: "12px" }}>
        <Panel>
          <strong>🏦 Resource Bank</strong>
          <hr
            style={{
              margin: "8px 0",
              borderColor: "#374151",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "18px",
            }}
          >
            <span>
              🧱 {game.resourceBank.brick}
            </span>
            <span>
              🌲 {game.resourceBank.lumber}
            </span>
            <span>
              🌾 {game.resourceBank.wheat}
            </span>
            <span>
              🐑 {game.resourceBank.sheep}
            </span>
            <span>
              ⛰️ {game.resourceBank.ore}
            </span>
          </div>
        </Panel>
      </div>
      {game.players.map((player) => (
        <div
          key={player.id}
          style={{
            marginBottom: "12px",
            borderRadius: "12px",
            boxShadow:
              player.id === game.currentPlayerId
                ? "0 0 18px 4px rgba(239, 68, 68, 0.8)"
                : "none",
            transition: "box-shadow 0.2s ease",
          }}
        >
          <Panel>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <strong
                  style={{
                    color:
                      player.id === game.currentPlayerId
                        ? "#ef4444"
                        : "white",
                    fontSize: "16px",
                  }}
                >
                  {player.name}
                </strong>
                <div
                  style={{
                    marginTop: "4px",
                    color: "#d1d5db",
                  }}
                >
                  VP: {player.vp}
                </div>
              </div>
              <div
                style={{
                  color: "#f9fafb",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
              >
                {player.guild
                  ? `${player.guild} Guild`
                  : "No Guild"}
              </div>
            </div>
            <hr
              style={{
                margin: "8px 0",
                borderColor: "#374151",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "18px",
                marginBottom: "8px",
              }}
            >
              <span>
                🧱 {player.resources.brick}
              </span>
              <span>
                🌲 {player.resources.lumber}
              </span>
              <span>
                🌾 {player.resources.wheat}
              </span>
              <span>
                🐑 {player.resources.sheep}
              </span>
              <span>
                ⛰️ {player.resources.ore}
              </span>
            </div>
            <hr
              style={{
                margin: "8px 0",
                borderColor: "#374151",
              }}
            />
            <div>
              🏠 Settlements Remaining:{" "}
              {5 - player.settlements.length}
            </div>
            <div>
              🛣️ Roads Remaining:{" "}
              {15 - player.roads.length}
            </div>
            <div>
              🏙️ Cities Remaining:{" "}
              {4 - player.cities.length}
            </div>
          </Panel>
        </div>
      ))}
    </div>
  );
}
export default PlayerPanel;