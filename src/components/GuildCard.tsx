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
        minHeight: "220px",
        boxSizing: "border-box",
        background: "#1f2937",
        color: "white",
        boxShadow: `0 0 18px ${guild.color}55`,
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform =
          "translateY(-6px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0)";
      }}
    >
      <h2>
        {guild.icon} {guild.name}
      </h2>
      <div>
        {guild.description}
      </div>
      <button
        type="button"
        onClick={onSelect}
        style={{
          marginTop: "16px",
          padding: "10px 18px",
          borderRadius: "8px",
          border: "none",
          background: guild.color,
          color: "#111827",
          fontWeight: "bold",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Choose {guild.name}
      </button>
    </div>
  );
}
export default GuildCard;