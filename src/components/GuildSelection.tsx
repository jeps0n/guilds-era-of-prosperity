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
        cursor: "default",
        userSelect: "none"
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "14px 28px",
            borderRadius: "12px",
            background: "linear-gradient(180deg, #3a321f, #252018)",
            border: "2px solid #64748B",
            boxShadow: "0 0 14px rgba(212, 175, 85, 0.25)",
            color: "#FFF8DF",
            textAlign: "center",
            margin: "0px 0px 24px"
          }}
        >
          <h1
            style={{
              margin: "0px",
              fontSize: "28px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            Guilds: Era of Prosperity
          </h1>
        </div>
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
            border: `4px solid ${playerName === "Zeke"
              ? "#f97316"
              : "#9333ea"
              }`,
            opacity: 0.9,
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
        Choose your Guild. Shape your colony.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 240px 240px",
          gridTemplateRows: "200px",
          gap: "18px",
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