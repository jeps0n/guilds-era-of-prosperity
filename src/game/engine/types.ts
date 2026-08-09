import type { Settlement } from "../domain/Settlement";
import type { DevelopmentCard } from "../domain/DevelopmentCard";
export type GuildType =
  | "builder"
  | "explorer"
  | "merchant";
export interface Resources {
  brick: number;
  lumber: number;
  wheat: number;
  sheep: number;
  ore: number;
}
export interface Player {
  id: string;
  name: string;
  guild?: GuildType;
  vp: number;
  resources: Resources;
  tradeRatios: Resources;
  roads: string[];
  settlements: Settlement[];
  cities: string[];
  developmentCards: DevelopmentCard[];
  superUnlocked: boolean;
  superUsed: boolean;
  secondaryRolls: number[];
}