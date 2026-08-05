import type { GuildType } from "../game/engine/types";

interface GuildSelectionProps {
  playerName: string;
  availableGuilds: GuildType[];
  onSelectGuild: (guild: GuildType) => void;
}

const guildOptions: {
  type: GuildType;
  name: string;
  description: string;
}[] = [
  {
    type: "builder",
    name: "Builder",
    description: "Focuses on construction and development.",
  },
  {
    type: "explorer",
    name: "Explorer",
    description: "Focuses on expansion and exploration.",
  },
  {
    type: "merchant",
    name: "Merchant",
    description: "Focuses on trading and resources.",
  },
];

function GuildSelection({
  playerName,
  availableGuilds,
  onSelectGuild,
}: GuildSelectionProps) {
  return (
    <div>
      <h2>{playerName}, choose your Guild</h2>

      {guildOptions
        .filter((guild) =>
            availableGuilds.includes(guild.type)
        )
        .map((guild) => (
        <button
          key={guild.type}
          onClick={() => onSelectGuild(guild.type)}
        >
          <h3>{guild.name}</h3>
          <p>{guild.description}</p>
        </button>
      ))}
    </div>
  );
}

export default GuildSelection;