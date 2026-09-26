import type { CSSProperties } from "react";
import type { GuildDefinition } from "../game/data/guilds";
interface GuildCardProps {
  guild: GuildDefinition;
  onSelect: () => void;
}
function GuildCard({ guild, onSelect }: GuildCardProps) {
  const style = { "--guild-color": guild.color } as CSSProperties;
  return (
    <button type="button" className="guild-card" style={style} onClick={onSelect}>
      <div className="guild-card__icon">{guild.icon}</div>
      <h2 className="guild-card__name">{guild.name}</h2>
      <div className="guild-card__desc">{guild.description}</div>
      <div className="guild-card__focus">
        <strong>Class Focus</strong>
        <ul className="guild-card__focus-list">
          <li>{guild.focus1}</li>
          {guild.focus2 ? <li>{guild.focus2}</li> : null}
        </ul>
      </div>
      <div className="guild-card__select">Select {guild.name}</div>
    </button>
  );
}
export default GuildCard;
