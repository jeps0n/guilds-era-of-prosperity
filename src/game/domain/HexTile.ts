export type ResourceType =
  | "brick"
  | "lumber"
  | "wheat"
  | "sheep"
  | "ore"
  | "desert";

export interface HexTile {
  id: string;

  resource: ResourceType;

  numberToken?: number;
}