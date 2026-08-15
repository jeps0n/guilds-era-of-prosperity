import type { Player, Resources } from "../../../engine/types";
type Resource = keyof Resources;
const CITY_COST: Resources = {
    brick: 0,
    lumber: 0,
    wheat: 2,
    sheep: 0,
    ore: 3,
};
const CITY_RESOURCES: Resource[] = [
    "ore",
    "wheat",
];
export function getEffectiveCityCost(
    player: Player,
    discountedResource?: Resource
): Resources {
    /*
     * Normal players and Builders whose passive has
     * already been used pay the normal city cost.
     */
    if (
        player.guild !== "builder" ||
        player.guildPassiveUsedThisTurn ||
        discountedResource === undefined
    ) {
        return CITY_COST;
    }
    /*
     * Only ore and wheat are valid city resources.
     * The caller should already validate this, but the
     * helper remains defensive so it cannot create an
     * invalid cost if called independently.
     */
    if (
        !CITY_RESOURCES.includes(
            discountedResource
        )
    ) {
        return CITY_COST;
    }
    return {
        ...CITY_COST,
        [discountedResource]: Math.max(
            0,
            CITY_COST[discountedResource] - 1
        ),
    };
}