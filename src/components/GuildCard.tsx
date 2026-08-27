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
      onClick={onSelect}
      style={{
        border: `3px solid ${guild.color}`,
        borderRadius: "12px",
        padding: "12px",
        width: "240px",
        minHeight: "200px",
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
        event.currentTarget.style.boxShadow =
          `0 0 24px ${guild.color}AA`;
        event.currentTarget.style.borderWidth = "4px";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform =
          "translateY(0)";
        event.currentTarget.style.boxShadow =
          `0 0 18px ${guild.color}55`;
        event.currentTarget.style.borderWidth = "4px";
      }}
    >
      {/* GUILD NAME */}
      <div
        style={{
          marginBottom: "14px",
        }}
      >
        <h2
          style={{
            margin: "0px",
            color: guild.color,
          }}
        >
          {guild.icon} {guild.name}
        </h2>
      </div>
      {/* DESCRIPTION */}
      <div
        style={{
          marginBottom: "14px",
          color: "#d1d5db",
          // lineHeight: 1.4,
        }}
      >
        {guild.description}
      </div>
      {/* FOCUS */}
      <div
        style={{
          paddingTop: "10px",
          borderTop: "1px solid #374151",
        }}
      >
        <div style={{
          marginBottom: "4px",
          fontWeight: "bold",
        }}>
          Focus
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: "18px",
          }}
        >
          <li>{guild.focus1}</li>
          {guild.focus2
            ? <li>{guild.focus2}</li>
            : null}
        </ul>
      </div>
    </div>
  );
}
export default GuildCard;