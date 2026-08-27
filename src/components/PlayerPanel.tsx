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
  const longestRoadPlayer = game.players.find(
    (player) =>
      player.id === game.longestRoadPlayerId
  );
  const largestArmyPlayer = game.players.find(
    (player) =>
      player.id === game.largestArmyPlayerId
  );
  return (
    <div style={{
      marginTop: "12px",
      cursor: "default",
      userSelect: "none"
    }}>
      <Panel>
        <strong>Resource Bank</strong>
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
        {game.players.map((player) => {
          const totalResources = Object.values(
            player.resources
          ).reduce(
            (total, amount) => total + amount,
            0
          );
          return (
            <div
              key={player.id}
              style={{
                marginBottom: "12px",
                borderRadius: "12px",
                boxShadow:
                  player.id === game.currentPlayerId
                    ? player.id === "player-1"
                      ? "0 0 18px 4px #f97316"
                      : "0 0 18px 4px #9333ea"
                    : "none",
                transition:
                  "box-shadow 0.5s ease",
              }}
            >
              {/* PLAYER CARDS */}
              <Panel
                background={
                  player.id === game.currentPlayerId
                    ? "#292f38"
                    : "#111827"
                }
                border={
                  player.id === game.currentPlayerId
                    ? "1px solid rgba(212, 175, 85, 0.69)"
                    : "1px solid #374151"
                }
              >
                {/* PLAYER NAME / GUILD / VP / RESOURCES */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "auto auto",
                    rowGap: "8px",
                    alignItems: "center",
                  }}
                >
                  {/* PLAYER NAME + VP - TOP LEFT */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifySelf: "start",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "rgba(0, 0, 0, 0.45)",
                        border:
                          player.id === game.currentPlayerId
                            ? "1px solid rgba(212, 175, 85, 0.36)"
                            : "1px solid transparent",
                      }}
                    >
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
                    </span>
                    {/* VP */}
                    <span
                      style={{
                        color: "#d1d5db",
                        fontWeight: "bold",
                      }}
                    >
                      VP: {player.vp}
                    </span>
                  </div>
                  {/* GUILD - TOP RIGHT */}
                  <div
                    style={{
                      justifySelf: "end",
                      color: "#f9fafb",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                  >
                    {player.guild
                      ? `${player.guild.charAt(0).toUpperCase()}${player.guild.slice(1)} Guild`
                      : "No Guild"}
                  </div>
                  {/* RESOURCES - BOTTOM LEFT */}
                  <div
                    style={{
                      color:
                        totalResources > 9
                          ? "#ef4444"
                          : "#f9fafb",
                      fontWeight:
                        totalResources > 9
                          ? "bold"
                          : "normal",
                      textAlign: "left",
                      fontSize: "13px",
                    }}
                  >
                    Resources:{" "}
                    {totalResources}
                  </div>
                  {/* EMPTY BOTTOM RIGHT */}
                  <div />
                </div>
                <hr
                  style={{
                    margin: "1px 0px 8px",
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
                {/* DEVELOPMENT / ACHIEVEMENT STATUS */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* DEVELOPMENT CARDS */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span>Development Cards:</span>
                    <span
                      style={{
                        width: "28px",
                        height: "24px",
                        borderRadius: "7px",
                        background: "#d1d5db",
                        color: "#111827",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {player.developmentCards.length}
                    </span>
                  </div>
                  {/* LARGEST ARMY */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span>Largest Army:</span>
                    <span
                      style={{
                        width: "28px",
                        height: "24px",
                        borderRadius: "7px",
                        border:
                          player.id === largestArmyPlayer?.id
                            ? "1px solid #D4AF37"
                            : "1px solid transparent",
                        boxShadow:
                          player.id === largestArmyPlayer?.id
                            ? "0 0 8px 2px #B8860B"
                            : "none",
                        transition:
                          "box-shadow 0.5s ease",
                        background:
                          player.id === largestArmyPlayer?.id
                            ? "#B8860B"
                            : "#d1d5db",
                        color:
                          player.id === largestArmyPlayer?.id
                            ? "#000000"
                            : "#111827",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {player.knightsPlayed}
                    </span>
                  </div>
                  {/* LONGEST ROAD */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span>Longest Road:</span>
                    <span
                      style={{
                        width: "28px",
                        height: "24px",
                        borderRadius: "7px",
                        border:
                          player.id === longestRoadPlayer?.id
                            ? "1px solid #D4AF37"
                            : "1px solid transparent",
                        boxShadow:
                          player.id === longestRoadPlayer?.id
                            ? "0 0 8px 2px #B8860B"
                            : "none",
                        transition:
                          "box-shadow 0.5s ease",
                        background:
                          player.id === longestRoadPlayer?.id
                            ? "#B8860B"
                            : "#d1d5db",
                        color:
                          player.id === longestRoadPlayer?.id
                            ? "#000000"
                            : "#111827",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {player.longestRoad}
                    </span>
                  </div>
                </div>
                <hr
                  style={{
                    margin: "8px 0",
                    borderColor: "#374151",
                  }}
                />
                {/* PIECES REMAINING */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    fontSize: "12px",
                  }}
                >
                  {/* ROADS */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>Roads:</span>
                    <span
                      style={{
                        width: "28px",
                        height: "24px",
                        borderRadius: "7px",
                        background:
                          player.id === "player-1"
                            ? "#f97316"
                            : "#9333ea",
                        color: "#000000",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {15 - player.roads.length}
                    </span>
                  </div>
                  {/* SETTLEMENTS */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>Settlements:</span>
                    <span
                      style={{
                        width: "28px",
                        height: "24px",
                        borderRadius: "7px",
                        background:
                          player.id === "player-1"
                            ? "#f97316"
                            : "#9333ea",
                        color: "#000000",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {5 - player.settlements.length}
                    </span>
                  </div>
                  {/* CITIES */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>Cities:</span>
                    <span
                      style={{
                        width: "28px",
                        height: "24px",
                        borderRadius: "7px",
                        background:
                          player.id === "player-1"
                            ? "#f97316"
                            : "#9333ea",
                        color: "#000000",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "13px",
                      }}
                    >
                      {4 - player.cities.length}
                    </span>
                  </div>
                </div>
              </Panel>
            </div>
          );
        })}
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