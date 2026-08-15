import type { GuildType, Resources } from "../engine/types";
import {
  canUseGuildPassive,
  getDiscountedCost,
  type GuildPassiveAction,
} from "./guildPassives";
export function getEffectiveCost(
  guild: GuildType | undefined,
  action: GuildPassiveAction,
  baseCost: Resources,
  passiveUsedThisTurn: boolean,
  discountedResource?: keyof Resources
): Resources {
  if (
    !canUseGuildPassive(
      guild,
      action,
      passiveUsedThisTurn
    )
  ) {
    return baseCost;
  }
  if (!discountedResource) {
    return baseCost;
  }
  return getDiscountedCost(
    baseCost,
    discountedResource
  );
}