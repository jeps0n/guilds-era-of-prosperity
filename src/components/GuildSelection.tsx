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
        background: "#111827",
        borderRadius: "16px",
        color: "white",
      }}
    >
  <div style={{ textAlign: "center" }}>
    <h2>
      🏛️ Guild Selection
    </h2>
    <div
      style={{
        padding: "8px 16px",
        borderRadius: "20px",
        background: "#374151",
        color: "#f9fafb",
        fontWeight: "bold",
      }}
    >
      {playerName}'s Turn
    </div>
    <p>
      Select the Guild that will shape your colony.
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