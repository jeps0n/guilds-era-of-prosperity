import type { CSSProperties } from "react";
import type { GameState } from "../game/engine/GameState";
import type { Resources } from "../game/engine/types";
import Panel from "./ui/Panel";
interface PlayerPanelProps {
  game: GameState;
  playerId?: string;
  showResourceBank?: boolean;
}
const RESOURCE_COLORS: Record<keyof Resources, string> = {
  brick: "#b45309", lumber: "#166534", wheat: "#eab308", sheep: "#65a30d", ore: "#6b7280",
};
const RESOURCE_LABELS: Record<keyof Resources, string> = {
  brick: "Brick", lumber: "Lumber", wheat: "Wheat", sheep: "Sheep", ore: "Ore",
};
function ResourceRow({ resources, warning = false }: { resources: Resources; warning?: boolean }) {
  return <div className={`hud-resource-row${warning ? " is-warning" : ""}`}>{(Object.keys(RESOURCE_COLORS) as (keyof Resources)[]).map((resource) => (
    <div className="hud-resource" key={resource} title={RESOURCE_LABELS[resource]}>
      <span className="hud-resource__token" style={{ background: RESOURCE_COLORS[resource] }}>{resources[resource]}</span>
      <span className="hud-resource__label">{RESOURCE_LABELS[resource]}</span>
    </div>
  ))}</div>;
}
function PlayerPanel({ game, playerId, showResourceBank = false }: PlayerPanelProps) {
  const player = game.players.find((candidate) => candidate.id === playerId) ?? game.players[0];
  if (!player) return null;
  const totalResources = Object.values(player.resources).reduce((total, amount) => total + amount, 0);
  const ownsLargestArmy = game.largestArmyPlayerId === player.id;
  const ownsLongestRoad = game.longestRoadPlayerId === player.id;
  const playerColor = player.id === "player-1" ? "#f97316" : "#9333ea";
  const remainingRoads = 15 - player.roads.length;
  const remainingSettlements = 5 - player.settlements.length;
  const remainingCities = 4 - player.cities.length;
  return <div className="player-panel">
    <Panel>
      <div className="hud-player-heading">
        <div className="hud-player-name" style={{ color: playerColor }}>{player.name}</div>
        <div className="hud-vp"><strong>{player.vp}</strong><span>VP</span></div>
      </div>
      <div className="hud-active-slot"><span>Active</span></div>
      <div className="hud-player-meta">
        <span>{player.guild ? `${player.guild[0].toUpperCase()}${player.guild.slice(1)} Guild` : "Guild unchosen"}</span>
        <span className={totalResources > 9 ? "hud-warning" : ""}>{totalResources} resources</span>
      </div>
      <ResourceRow resources={player.resources} warning={totalResources > 9} />
      <div className="hud-stat-stack" style={{ "--player-color": playerColor } as CSSProperties}>
        <div className={`hud-stat-row hud-stat-row--piece${remainingRoads === 0 ? " is-exhausted" : ""}`}><span>Roads</span><strong>{remainingRoads}</strong></div>
        <div className={`hud-stat-row hud-stat-row--piece${remainingSettlements === 0 ? " is-exhausted" : ""}`}><span>Settlements</span><strong>{remainingSettlements}</strong></div>
        <div className={`hud-stat-row hud-stat-row--piece${remainingCities === 0 ? " is-exhausted" : ""}`}><span>Cities</span><strong>{remainingCities}</strong></div>
        <div className="hud-stat-row"><span>Dev Cards</span><strong>{player.developmentCards.length}</strong></div>
        <div className={`hud-stat-row${ownsLargestArmy ? " hud-stat-row--achievement-owned" : ""}`}><span>Largest Army</span><strong className={ownsLargestArmy ? "hud-award" : ""}>{player.knightsPlayed}</strong></div>
        <div className={`hud-stat-row${ownsLongestRoad ? " hud-stat-row--achievement-owned" : ""}`}><span>Longest Road</span><strong className={ownsLongestRoad ? "hud-award" : ""}>{player.longestRoad}</strong></div>
      </div>
    </Panel>
    {showResourceBank && <div className="hud-bank"><Panel><strong>Resource Bank</strong><ResourceRow resources={game.resourceBank} /></Panel></div>}
  </div>;
}
export default PlayerPanel;
