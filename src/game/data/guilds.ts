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
  focus1: string;
  focus2?: string;
}
export const GUILDS: GuildDefinition[] = [
  {
    type: "builder",
    name: "Builder",
    icon: "🔨",
    color: "#C08457",
    description: "Forge through construction and improvement.",
    superName: "Master Builder",
    superDescription: "Build 1 free Settlement or City",
    passiveName: "Construct ",
    passiveDescription: "Pay 1 less required resource to build a Settlement or build a City",
    focus1: "Settlements",
    focus2: "Cities",
  },
  {
    type: "explorer",
    name: "Explorer",
    icon: "🧭",
    color: "#2D9CDB",
    description: "Venture through expansion and exploration.",
    superName: "Grand Expedition",
    superDescription: "Build up to 3 free Roads",
    passiveName: "Explore ",
    passiveDescription: "Pay 1 less required resource to build a Road",
    focus1: "Roads",
    focus2: undefined,
  },
  {
    type: "merchant",
    name: "Merchant",
    icon: "📜",
    color: "#D4A017",
    description: "Thrive through development and trading.",
    superName: "Market Insight",
    superDescription: "Get 2 free Development Cards",
    passiveName: "Barter ",
    passiveDescription: "Pay 1 less required resource to make a Bank Trade or buy a Development Card",
    focus1: "Development Cards",
    focus2: "Trade",
  },
];