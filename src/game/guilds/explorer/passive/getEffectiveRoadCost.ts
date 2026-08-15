import type { Player, Resources } from "../../../engine/types";
const ROAD_COST: Resources = {
    brick: 1,
    lumber: 1,
    wheat: 0,
    sheep: 0,
    ore: 0,
};
export function getEffectiveRoadCost(
    player: Player
): Resources {
    if (
        player.guild === "explorer" &&
        !player.guildPassiveUsedThisTurn
    ) {
        return {
            ...ROAD_COST,
            [getDiscountedResource(player)]: 0,
        };
    }
    return ROAD_COST;
}
function getDiscountedResource(
    player: Player
): keyof Resources {
    if (player.resources.brick >= 1) {
        return "brick";
    }
    return "lumber";
}