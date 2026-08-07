export type DevelopmentCardType =
  | "knight"
  | "road_building"
  | "year_of_plenty"
  | "monopoly"
  | "victory_point";
export interface DevelopmentCard {
  id: string;
  type: DevelopmentCardType;
}