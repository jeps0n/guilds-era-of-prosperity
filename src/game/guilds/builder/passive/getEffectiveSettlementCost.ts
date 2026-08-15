import type { Player, Resources } from "../../../engine/types";
const SETTLEMENT_COST: Resources = {
  brick: 1,
  lumber: 1,
  wheat: 1,
  sheep: 1,
  ore: 0,
};
export function getEffectiveSettlementCost(
  player: Player,
  discountedResource?: keyof Resources
): Resources {
  if (
    player.guild !== "builder" ||
    player.guildPassiveUsedThisTurn ||
    !discountedResource
  ) {
    return SETTLEMENT_COST;
  }
  return {
    ...SETTLEMENT_COST,
    [discountedResource]: Math.max(
      0,
      SETTLEMENT_COST[discountedResource] - 1
    ),
  };
}