import type { GuildDefinition } from "../game/data/guilds";

interface GuildCardProps {
  guild: GuildDefinition;
  onSelect: () => void;
}

function GuildCard({
  guild,
  onSelect,
}: GuildCardProps) {
  return (
    <div
      style={{
        border: `3px solid ${guild.color}`,
        borderRadius: "12px",
        padding: "20px",
        width: "220px",
        background: "#1f2937",
        color: "white",
      }}
    >
      <h2>
        {guild.icon} {guild.name}
      </h2>

      <p>{guild.description}</p>

      <button onClick={onSelect}>
        Choose {guild.name}
      </button>
    </div>
  );
}

export default GuildCard;