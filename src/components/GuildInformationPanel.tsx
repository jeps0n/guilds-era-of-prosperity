import { useEffect, useRef, useState, type CSSProperties } from "react";
import Panel from "./ui/Panel";
import { GUILDS } from "../game/data/guilds";
import type { GameState } from "../game/engine/GameState";
interface GuildInformationPanelProps {
  era: GameState["era"];
  player: GameState["players"][number];
  prosperityRollSequenceActive: boolean;
  roadBuildingPending: boolean;
  robberPending: boolean;
  superMenuIsOpen: boolean;
  onUseSuper?: () => void;
  interactive?: boolean;
}
function GuildInformationPanel({ era, player, prosperityRollSequenceActive, roadBuildingPending, robberPending, superMenuIsOpen, onUseSuper, interactive = true }: GuildInformationPanelProps) {
  const guild = GUILDS.find((entry) => entry.type === player.guild);
  const collectedFaces = new Set(player.secondaryRolls);
  const collectedCount = collectedFaces.size;
  const previousCollectedCount = useRef(collectedCount);
  const previousPassiveUsed = useRef(player.guildPassiveUsedThisTurn);
  const previousSuperUnlocked = useRef(player.superUnlocked);
  const previousSuperUsed = useRef(player.superUsed);
  const [feedback, setFeedback] = useState<"die" | "passive" | "ready" | "activate" | "used" | null>(null);
  useEffect(() => {
    let next: typeof feedback = null;
    if (!previousSuperUsed.current && player.superUsed) next = "used";
    else if (!previousSuperUnlocked.current && player.superUnlocked) next = "ready";
    else if (previousCollectedCount.current < collectedCount) next = "die";
    else if (!previousPassiveUsed.current && player.guildPassiveUsedThisTurn) next = "passive";
    previousCollectedCount.current = collectedCount;
    previousPassiveUsed.current = player.guildPassiveUsedThisTurn;
    previousSuperUnlocked.current = player.superUnlocked;
    previousSuperUsed.current = player.superUsed;
    if (!next) return;
    setFeedback(next);
    const timer = window.setTimeout(() => setFeedback(null), next === "ready" ? 950 : 620);
    return () => window.clearTimeout(timer);
  }, [collectedCount, player.guildPassiveUsedThisTurn, player.superUnlocked, player.superUsed]);
  if (!guild) return null;
  const superReady = player.superUnlocked && collectedCount === 6 && !player.superUsed;
  const canOpenSuper = superReady && !prosperityRollSequenceActive;
  const superDisabled = !interactive || era !== "prosperity" || player.superUsed || roadBuildingPending || robberPending || superMenuIsOpen;
  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  const superState = player.superUsed ? "used" : superReady ? "ready" : "locked";
  const readyIsActionable = interactive && canOpenSuper && !superDisabled;
  const readyIsInactive = superReady && !readyIsActionable;
  const playerColor = player.id === "player-1" ? "#f97316" : "#9333ea";
  const [superTitleFirst, ...superTitleRest] = guild.superName.toUpperCase().split(" ");
  const superContents = (
    <>
      <span className="guild-hud__super-name"><span>{superTitleFirst}</span><span>{superTitleRest.join(" ")}</span></span>
      <span className="guild-hud__super-kicker">SUPER</span>
      {superState !== "ready" && (
        <div className="guild-hud__super-dice" aria-label={`${collectedCount} of 6 Prosperity dice collected`}>
          {diceFaces.map((face, index) => {
            const value = index + 1;
            const claimed = collectedFaces.has(value);
            return (
              <span className={`guild-hud__super-die${claimed ? " is-claimed" : ""}${feedback === "die" && claimed && value === player.secondaryRolls[player.secondaryRolls.length - 1] ? " feedback-prosperity-die" : ""}`} key={face}>
                <b>{face}</b><small>{value}</small>
              </span>
            );
          })}
        </div>
      )}
      {superState === "locked" && <><strong className="guild-hud__super-state">🔒 LOCKED</strong><em>{collectedCount} / 6 PROSPERITY</em></>}
      {superState === "ready" && <><strong className="guild-hud__super-state">READY</strong><em>✦ USE SUPER ✦</em></>}
      {superState === "used" && <><strong className="guild-hud__super-state">SUPER USED</strong><em>ABILITY EXPENDED</em></>}
    </>
  );
  return <div className="guild-hud" style={{ "--guild-color": guild.color, "--player-color": playerColor } as CSSProperties}>
    <Panel>
      <div className="guild-hud__heading"><span>{guild.type.toUpperCase()} GUILD</span></div>
      <div className={`guild-hud__ability${feedback === "passive" ? " feedback-passive-used" : ""}`}><div className="guild-hud__ability-row"><strong>{guild.passiveName}</strong><span className={`guild-hud__passive-status ${player.guildPassiveUsedThisTurn ? "is-used" : "is-available"}`}>PASSIVE · {player.guildPassiveUsedThisTurn ? "USED" : "AVAILABLE"}</span></div><p>{guild.passiveDescription}</p></div>
      <div className="guild-hud__ability guild-hud__ability--super"><div className="guild-hud__ability-row"><strong>{guild.superName}</strong><span className="guild-hud__ability-type">SUPER</span></div><p>{guild.superDescription}</p></div>
      {interactive && canOpenSuper ? (
        <button
          className={`guild-hud__super-button is-ready${readyIsInactive ? " is-ready-inactive" : ""}${feedback === "ready" ? " feedback-super-ready" : ""}${feedback === "activate" ? " feedback-super-activate" : ""}${feedback === "used" ? " feedback-super-used" : ""}`}
          type="button"
          onClick={() => { setFeedback("activate"); onUseSuper?.(); }}
          disabled={superDisabled}
        >
          {superContents}
        </button>
      ) : (
        <div className={`guild-hud__super-button guild-hud__super-button--display is-${superState}${readyIsInactive ? " is-ready-inactive" : ""}${feedback === "ready" ? " feedback-super-ready" : ""}${feedback === "activate" ? " feedback-super-activate" : ""}${feedback === "used" ? " feedback-super-used" : ""}`}>
          {superContents}
        </div>
      )}
    </Panel>
  </div>;
}
export default GuildInformationPanel;
