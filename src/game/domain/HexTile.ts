export type ResourceType =
  | "brick"
  | "lumber"
  | "wheat"
  | "sheep"
  | "ore"
  | "desert";

export interface HexTile {
  id: string;

  x: number;
  y: number;

  resource: ResourceType;

  numberToken?: number;
}