import type { DevelopmentCard } from "../domain/DevelopmentCard";
export const DEVELOPMENT_CARD_DECK: DevelopmentCard[] = [
  // Knights (14)
  ...Array.from({ length: 14 }, (_, i) => ({
    id: `knight-${i + 1}`,
    type: "knight" as const,
  })),
  // Victory Points (5)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `vp-${i + 1}`,
    type: "victory_point" as const,
  })),
  // Road Building (2)
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `road-${i + 1}`,
    type: "road_building" as const,
  })),
  // Year of Plenty (2)
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `plenty-${i + 1}`,
    type: "year_of_plenty" as const,
  })),
  // Monopoly (2)
  ...Array.from({ length: 2 }, (_, i) => ({
    id: `monopoly-${i + 1}`,
    type: "monopoly" as const,
  })),
];