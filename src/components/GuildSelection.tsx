import type { GuildType } from "../game/engine/types";
import { GUILDS } from "../game/data/guilds";
import GuildCard from "./GuildCard";

interface GuildSelectionProps {
  playerName: string;
  availableGuilds: GuildType[];
  onSelectGuild: (guild: GuildType) => void;
}

function GuildSelection({
  playerName,
  availableGuilds,
  onSelectGuild,
}: GuildSelectionProps) {
  return (
    <div>
      <h2>{playerName}, choose your Guild</h2>

      {GUILDS
        .filter((guild) =>
            availableGuilds.includes(guild.type)
        )
        .map((guild) => (
          <button
            key={guild.type}
            onClick={() => onSelectGuild(guild.type)}
          >
            <h3>
              {guild.icon} {guild.name}
            </h3>

            <p>{guild.description}</p>
          </button>
      ))}
      
    </div>
  );
}

export default GuildSelection;