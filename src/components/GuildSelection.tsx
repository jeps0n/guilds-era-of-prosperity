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
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "40px",
      }}
    >
  <div style={{ textAlign: "center" }}>
    <h2>{playerName}, choose your Guild</h2>

    <p>
      Select the Guild that will shape your civilization.
    </p>
  </div>

  <div
    style={{
      display: "flex",
      gap: "24px",
      justifyContent: "center",
      flexWrap: "wrap",
    }}
  >
    {GUILDS
      .filter((guild) =>
        availableGuilds.includes(guild.type)
      )
      .map((guild) => (
        <GuildCard
          key={guild.type}
          guild={guild}
          onSelect={() => onSelectGuild(guild.type)}
        />
      ))}
  </div>

    </div>
  );
}

export default GuildSelection;