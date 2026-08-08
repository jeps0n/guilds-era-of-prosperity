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
        width: "100%",
        maxWidth: "1000px",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px",
        padding: "40px",
        background: "#111827",
        borderRadius: "16px",
        color: "white",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
          }}
        >
          🏛️ Guild Selection
        </h2>
        <div
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: "20px",
            background: "#374151",
            color: "#f9fafb",
            fontWeight: "bold",
          }}
        >
          {playerName}'s Turn
        </div>
        <p
          style={{
            margin: "12px 0 0",
            color: "#d1d5db",
          }}
        >
          Select the Guild that will shape your colony.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 220px 220px",
          gridTemplateRows: "220px",
          gap: "24px",
          justifyContent: "center",
          alignItems: "start",
        }}
      >
        {GUILDS.map((guild) => {
          const isAvailable =
            availableGuilds.includes(guild.type);
          return (
            <div
              key={guild.type}
              style={{
                width: "220px",
                height: "220px",
              }}
            >
              {isAvailable && (
                <GuildCard
                  guild={guild}
                  onSelect={() =>
                    onSelectGuild(guild.type)
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default GuildSelection;