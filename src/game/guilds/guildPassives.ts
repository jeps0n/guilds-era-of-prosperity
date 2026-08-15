import type { GuildType, Resources } from "../engine/types";
export type GuildPassiveAction =
    | "settlement"
    | "city"
    | "road"
    | "bank_trade"
    | "development_card";
export function canUseGuildPassive(
    guild: GuildType | undefined,
    action: GuildPassiveAction,
    passiveUsedThisTurn: boolean
): boolean {
    if (!guild || passiveUsedThisTurn) {
        return false;
    }
    switch (guild) {
        case "builder":
            return (
                action === "settlement" ||
                action === "city"
            );
        case "explorer":
            return action === "road";
        case "merchant":
            return (
                action === "bank_trade" ||
                action === "development_card"
            );
        default:
            return false;
    }
}
export function getDiscountedCost(
    cost: Resources,
    discountedResource: keyof Resources
): Resources {
    if (cost[discountedResource] <= 0) {
        return cost;
    }
    return {
        ...cost,
        [discountedResource]: cost[discountedResource] - 1,
    };
}