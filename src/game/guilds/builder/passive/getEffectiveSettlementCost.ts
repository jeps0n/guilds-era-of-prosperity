import type { Player, Resources } from "../../../engine/types";
type Resource = keyof Resources;
const SETTLEMENT_COST: Resources = {
    brick: 1,
    lumber: 1,
    wheat: 1,
    sheep: 1,
    ore: 0,
};
const SETTLEMENT_RESOURCES: Resource[] = [
    "brick",
    "lumber",
    "wheat",
    "sheep",
];
export function getEffectiveSettlementCost(
    player: Player,
    discountedResource?: Resource
): Resources {
    /*
     * Normal settlement cost:
     *
     * 1 brick
     * 1 lumber
     * 1 wheat
     * 1 sheep
     */
    if (
        player.guild !== "builder" ||
        player.guildPassiveUsedThisTurn ||
        !discountedResource ||
        !SETTLEMENT_RESOURCES.includes(
            discountedResource
        )
    ) {
        return SETTLEMENT_COST;
    }
    /*
     * Builder passive:
     *
     * The first settlement or city of the turn
     * costs one fewer required resource.
     *
     * For a settlement, the player chooses which
     * one of the four required resources to keep.
     *
     * Example:
     *   keep brick  -> pay lumber + wheat + sheep
     *   keep lumber -> pay brick + wheat + sheep
     */
    return {
        ...SETTLEMENT_COST,
        [discountedResource]: 0,
    };
}