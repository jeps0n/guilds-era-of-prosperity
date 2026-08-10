import type { GameState } from "../game/engine/GameState";
import Panel from "./ui/Panel";
import type { Resources } from "../game/engine/types";
interface PlayerPanelProps {
  game: GameState;
}
interface ResourceBadgeProps {
  color: string;
  value: number;
  label: string;
}
const RESOURCE_COLORS = {
  brick: "#b45309",
  lumber: "#166534",
  wheat: "#eab308",
  sheep: "#65a30d",
  ore: "#6b7280",
};
function ResourceBadge({
  color,
  value,
  label,
}: ResourceBadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "7px",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000000",
          fontWeight: "bold",
          fontSize: "15px",
        }}
      >
        {value}
      </div>
      <span
        style={{
          fontSize: "11px",
          color: "#d1d5db",
        }}
      >
        {label}
      </span>
    </div>
  );
}
function PlayerPanel({
  game,
}: PlayerPanelProps) {
  return (
    <div style={{ marginTop: "8px" }}>
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
          {renderResourceBadges(game.resourceBank)}
        </div>
      </Panel>
      <div style={{ marginTop: "12px" }}>
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
              transition:
                "box-shadow 0.2s ease",
            }}
          >
            <Panel>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <strong
                    style={{
                      color:
                        player.id === "player-1"
                          ? "#f97316"
                          : "#9333ea",
                      fontSize: "18px",
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
                    ? `${player.guild.charAt(0).toUpperCase()}${player.guild.slice(1)} Guild`
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
                  justifyContent:
                    "space-between",
                  fontSize: "18px",
                  marginBottom: "8px",
                }}
              >
                {renderResourceBadges(player.resources)}
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
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#f9fafb",
                  fontWeight: "bold",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "20px",
                    borderRadius: "4px",
                    border: "1px solid #60a5fa",
                    background:
                      "linear-gradient(135deg, #1e3a8a, #312e81)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                  }}
                >
                  🎴
                </span>
                Development Cards
              </span>
              <strong
                style={{
                  color: "#f9fafb",
                  fontSize: "16px",
                }}
              >
                {player.developmentCards.length}
              </strong>
            </div>
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
    </div>
  );
}
function renderResourceBadges(
  resources: Resources
) {
  return (
    <>
      <ResourceBadge
        color={RESOURCE_COLORS.brick}
        value={resources.brick}
        label="Brick"
      />
      <ResourceBadge
        color={RESOURCE_COLORS.lumber}
        value={resources.lumber}
        label="Lumber"
      />
      <ResourceBadge
        color={RESOURCE_COLORS.wheat}
        value={resources.wheat}
        label="Wheat"
      />
      <ResourceBadge
        color={RESOURCE_COLORS.sheep}
        value={resources.sheep}
        label="Sheep"
      />
      <ResourceBadge
        color={RESOURCE_COLORS.ore}
        value={resources.ore}
        label="Ore"
      />
    </>
  );
}
export default PlayerPanel;