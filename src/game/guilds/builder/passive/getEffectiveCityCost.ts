import type { Player, Resources } from "../../../engine/types";
const CITY_COST: Resources = {
  brick: 0,
  lumber: 0,
  wheat: 2,
  sheep: 0,
  ore: 3,
};
export function getEffectiveCityCost(
  player: Player
): Resources {
  if (
    player.guild === "builder" &&
    !player.guildPassiveUsedThisTurn
  ) {
    return {
      ...CITY_COST,
      [getDiscountedResource(player)]: 0,
    };
  }
  return CITY_COST;
}
function getDiscountedResource(
  player: Player
): keyof Resources {
  if (player.resources.ore >= 1) {
    return "ore";
  }
  return "wheat";
}