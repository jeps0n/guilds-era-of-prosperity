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

  roads: string[];
  settlements: string[];
  cities: string[];

  superUnlocked: boolean;
  superUsed: boolean;

  secondaryRolls: number[];
}