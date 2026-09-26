import type { GameState } from "../game/engine/GameState";
import type { Resources } from "../game/engine/types";
interface GameStatusProps {
  game: GameState;
  onRestoreCheckpoint: () => void;
  canRestoreCheckpoint: boolean;
  showResourceBank?: boolean;
}
const RESOURCE_COLORS: Record<keyof Resources, string> = {
  brick: "#b45309", lumber: "#166534", wheat: "#eab308", sheep: "#65a30d", ore: "#6b7280",
};
const RESOURCE_LABELS: Record<keyof Resources, string> = {
  brick: "Brick", lumber: "Lumber", wheat: "Wheat", sheep: "Sheep", ore: "Ore",
};
function GameStatus({ game, onRestoreCheckpoint, canRestoreCheckpoint, showResourceBank = false }: GameStatusProps) {
  const phaseLabel = game.phase.replaceAll("_", " ");
  return (
    <div className="game-status">
      <div className="game-status__primary">
        <div className="game-status__campaign">
          <span className="game-status__eyebrow">Current Campaign:</span>
          <span className="game-status__phase">{phaseLabel}</span>
        </div>
        <div className="game-status__turn"><span>Turn</span><strong>{game.turnNumber}</strong></div>
        <button type="button" className="game-status__restore" onClick={onRestoreCheckpoint} disabled={!canRestoreCheckpoint}>
          Turn Back
        </button>
      </div>
      {showResourceBank && (
        <div className="game-status__bank">
          <span className="game-status__bank-label">Resource Bank</span>
          <div className="game-status__bank-resources">
            {(Object.keys(RESOURCE_COLORS) as (keyof Resources)[]).map((resource) => (
              <div className="game-status__bank-resource" key={resource} title={RESOURCE_LABELS[resource]}>
                <span style={{ background: RESOURCE_COLORS[resource] }}>{game.resourceBank[resource]}</span>
                <small>{RESOURCE_LABELS[resource]}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default GameStatus;
