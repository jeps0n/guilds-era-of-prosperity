import type { GuildType } from "../engine/types";

export interface GuildDefinition {
  type: GuildType;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const GUILDS: GuildDefinition[] = [
  {
    type: "builder",
    name: "Builder",
    icon: "🏗️",
    color: "#C08457",
    description: "Focuses on construction and development.",
  },
  {
    type: "explorer",
    name: "Explorer",
    icon: "🧭",
    color: "#2D9CDB",
    description: "Focuses on expansion and exploration.",
  },
  {
    type: "merchant",
    name: "Merchant",
    icon: "💰",
    color: "#D4A017",
    description: "Focuses on trading and resources.",
  },
];