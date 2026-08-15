import type { Player, Resources } from "../../../engine/types";
type Resource = keyof Resources;
const DEVELOPMENT_CARD_RESOURCES: Resource[] = [
  "ore",
  "wheat",
  "sheep",
];
export function getEffectiveDevelopmentCardCost(
  player: Player,
  keepResource?: Resource
): Resource[] | undefined {
  const availableResources =
    DEVELOPMENT_CARD_RESOURCES.filter(
      (resource) => player.resources[resource] >= 1
    );
  if (availableResources.length < 2) {
    return undefined;
  }
  if (availableResources.length === 2) {
    return availableResources;
  }
  if (
    keepResource === undefined ||
    !DEVELOPMENT_CARD_RESOURCES.includes(keepResource)
  ) {
    return undefined;
  }
  return DEVELOPMENT_CARD_RESOURCES.filter(
    (resource) => resource !== keepResource
  );
}