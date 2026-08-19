import type { GuildType } from "../engine/types";
export interface GuildDefinition {
  type: GuildType;
  name: string;
  icon: string;
  color: string;
  description: string;
  superName: string;
  superDescription: string;
  passiveName: string;
  passiveDescription: string;
}
export const GUILDS: GuildDefinition[] = [
  {
    type: "builder",
    name: "Builder",
    icon: "🔨",
    color: "#C08457",
    description: "Focuses on construction and improvement.",
    superName: "Master Builder",
    superDescription: "Build 1 free Settlement or City",
    passiveName: "Construct ",
    passiveDescription: "Pay 1 less required resource to build a Settlement or build a City"
  },
  {
    type: "explorer",
    name: "Explorer",
    icon: "🧭",
    color: "#2D9CDB",
    description: "Focuses on expansion and exploration.",
    superName: "Grand Expedition",
    superDescription: "Build up to 3 free Roads",
    passiveName: "Explore ",
    passiveDescription: "Pay 1 less required resource to build a Road"
  },
  {
    type: "merchant",
    name: "Merchant",
    icon: "📜",
    color: "#D4A017",
    description: "Focuses on trading and development.",
    superName: "Market Insight",
    superDescription: "Get 2 free Development Cards",
    passiveName: "Barter ",
    passiveDescription: "Pay 1 less required resource to make a Bank Trade or buy a Development Card"
  },
];