import type { Player, Resources } from "../../../engine/types";
type Resource = keyof Resources;
const ROAD_RESOURCES: Resource[] = [
    "brick",
    "lumber",
];
export function getEffectiveRoadCost(
    player: Player,
    keepResource?: Resource
): Resource[] | undefined {
    const availableResources =
        ROAD_RESOURCES.filter(
            (resource) =>
                player.resources[resource] >= 1
        );
    /*
     * Explorer still needs at least one of the
     * two normal road resources.
     *
     * No brick and no lumber = cannot use the passive.
     */
    if (availableResources.length < 1) {
        return undefined;
    }
    /*
     * Explorer has only one of the two resources.
     * Automatically use that resource as payment.
     *
     * Example:
     *   1 brick, 0 lumber -> [brick]
     *   0 brick, 1 lumber -> [lumber]
     */
    if (availableResources.length === 1) {
        return availableResources;
    }
    /*
     * Explorer has both brick and lumber.
     *
     * We cannot automatically choose the payment resource.
     * The UI must tell us which resource the player wants
     * to keep.
     */
    if (
        keepResource === undefined ||
        !ROAD_RESOURCES.includes(keepResource)
    ) {
        return undefined;
    }
    /*
     * Pay the resource the player did NOT choose to keep.
     *
     * Example:
     *   keep brick -> [lumber]
     *   keep lumber -> [brick]
     */
    return ROAD_RESOURCES.filter(
        (resource) => resource !== keepResource
    );
}