import type { GuildType } from "../game/engine/types";
import { GUILDS } from "../game/data/guilds";
import GuildCard from "./GuildCard";
interface GuildSelectionProps {
  playerName: string;
  availableGuilds: GuildType[];
  onSelectGuild: (guild: GuildType) => void;
}
function GuildSelection({ playerName, availableGuilds, onSelectGuild }: GuildSelectionProps) {
  return (
    <div className="guild-selection">
      <div className="guild-selection__heading">
        <div className="guild-selection__eyebrow">Choose your path to prosperity</div>
        <h1 className="guild-selection__title">Guilds: Era of Prosperity</h1>
        <div className="guild-selection__turn">{playerName} · Choose Your Guild</div>
      </div>
      <div className="guild-selection__grid">
        {GUILDS.map((guild) => {
          const isAvailable = availableGuilds.includes(guild.type);
          return (
            <div className="guild-selection__slot" key={guild.type}>
              {isAvailable && (
                <GuildCard guild={guild} onSelect={() => onSelectGuild(guild.type)} />
              )}
            </div>
          );
        })}
      </div>
      <footer className="guild-selection__signature" aria-label="Technical demonstration credits">
        <div className="guild-selection__signature-credit"><span>TECHNICAL DEMONSTRATION BY</span> <strong>jeff samson</strong></div>
        <small>REACT · TYPESCRIPT · VITE · VITEST · CSS</small>
      </footer>
    </div>
  );
}
export default GuildSelection;
