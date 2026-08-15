import type { GameState } from "../../engine/GameState";
export interface ActionAvailability {
    canRollDice: boolean;
    canTrade: boolean;
    canRoad: boolean;
    canSettlement: boolean;
    canCity: boolean;
    canBuyDevelopmentCard: boolean;
    canPlayDevelopmentCard: boolean;
    canEndTurn: boolean;
}
export function getActionAvailability(
    game: GameState
): ActionAvailability {
    const currentPlayer = game.players.find(
        (player) =>
            player.id === game.currentPlayerId
    );
    if (!currentPlayer) {
        return {
            canRollDice: false,
            canTrade: false,
            canRoad: false,
            canSettlement: false,
            canCity: false,
            canBuyDevelopmentCard: false,
            canPlayDevelopmentCard: false,
            canEndTurn: false,
        };
    }
    const resources = currentPlayer.resources;
    /*
     * Explorer passive availability:
     *
     * Explorer receives one discounted road per turn.
     * The passive is available until it is consumed.
     */
    const isExplorer =
        currentPlayer.guild === "explorer";
    const explorerPassiveAvailable =
        isExplorer &&
        !currentPlayer.guildPassiveUsedThisTurn;
    /*
     * Explorer with an unused passive:
     *
     * Requires at least one of the two normal road
     * resources (brick or lumber).
     *
     * If the Explorer has only one resource, the road
     * can be built automatically using that resource.
     *
     * If the Explorer has both resources, the UI will
     * open the Explorer discount menu and let the player
     * choose which resource to keep.
     */
    const roadResourcesAvailable =
        ["brick", "lumber"].filter(
            (resource) =>
                resources[
                resource as "brick" | "lumber"
                ] >= 1
        ).length;
    const canRoad =
        (
            explorerPassiveAvailable &&
            roadResourcesAvailable >= 1
        ) ||
        (
            /*
             * Normal player, or Explorer whose passive
             * has already been used:
             *
             * Requires the normal road cost of
             * 1 brick + 1 lumber.
             */
            !explorerPassiveAvailable &&
            resources.brick >= 1 &&
            resources.lumber >= 1
        );
    /*
     * Builder passive availability:
     *
     * Builder receives one discounted settlement OR
     * city per turn.
     *
     * The passive is available until the first
     * discounted construction is successfully completed.
     */
    const isBuilder =
        currentPlayer.guild === "builder";
    const builderPassiveAvailable =
        isBuilder &&
        !currentPlayer.guildPassiveUsedThisTurn;
    /*
     * Builder settlement:
     *
     * Normal settlement cost:
     * 1 brick + 1 lumber + 1 wheat + 1 sheep.
     *
     * Builder may omit one required resource when the
     * passive is available.
     *
     * Therefore at least 3 of the 4 required resources
     * must be available.
     */
    const settlementResourcesAvailable =
        (
            [
                "brick",
                "lumber",
                "wheat",
                "sheep",
            ] as const
        ).filter(
            (resource) =>
                resources[resource] >= 1
        ).length;
    const canSettlement =
        (
            builderPassiveAvailable &&
            settlementResourcesAvailable >= 3
        ) ||
        (
            /*
             * Normal player, or Builder whose passive
             * has already been used:
             *
             * Requires the complete settlement cost.
             */
            !builderPassiveAvailable &&
            resources.brick >= 1 &&
            resources.lumber >= 1 &&
            resources.wheat >= 1 &&
            resources.sheep >= 1
        );
    /*
     * Builder city:
     *
     * Normal city cost:
     * 3 ore + 2 wheat.
     *
     * With the Builder passive, one required resource
     * may be omitted:
     *
     *   2 ore + 2 wheat
     * OR
     *   3 ore + 1 wheat
     */
    const builderCanAffordDiscountedCity =
        (
            resources.ore >= 2 &&
            resources.wheat >= 2
        ) ||
        (
            resources.ore >= 3 &&
            resources.wheat >= 1
        );
    const canCity =
        (
            builderPassiveAvailable &&
            builderCanAffordDiscountedCity
        ) ||
        (
            /*
             * Normal player, or Builder whose passive
             * has already been used:
             *
             * Requires the complete city cost.
             */
            !builderPassiveAvailable &&
            resources.ore >= 3 &&
            resources.wheat >= 2
        );
    /*
     * Merchant passive availability:
     *
     * Merchant receives one discounted development card
     * purchase per turn.
     */
    const isMerchant =
        currentPlayer.guild === "merchant";
    const merchantPassiveAvailable =
        isMerchant &&
        !currentPlayer.guildPassiveUsedThisTurn;
    const requiredDevelopmentResources = [
        "ore",
        "wheat",
        "sheep",
    ] as const;
    const developmentResourcesAvailable =
        requiredDevelopmentResources.filter(
            (resource) =>
                resources[resource] >= 1
        ).length;
    const canBuyDevelopmentCard =
        game.developmentDeck.length > 0 &&
        (
            /*
             * Normal player, or Merchant whose passive
             * has already been used:
             *
             * Requires all three resources.
             */
            (
                !merchantPassiveAvailable &&
                requiredDevelopmentResources.every(
                    (resource) =>
                        resources[resource] >= 1
                )
            ) ||
            /*
             * Merchant with an unused passive:
             *
             * Requires at least two of the three
             * development-card resources.
             *
             * If all three are available, the UI opens
             * the Merchant discount menu so the player
             * can choose which resource to keep.
             */
            (
                merchantPassiveAvailable &&
                developmentResourcesAvailable >= 2
            )
        );
    const hasRolled =
        game.lastDiceRoll !== undefined;
    const canTrade =
        game.phase === "playing" &&
        hasRolled;
    const hasDevelopmentCard =
        currentPlayer.developmentCards.length > 0;
    const canPlayDevelopmentCard =
        game.phase === "playing" &&
        hasRolled &&
        hasDevelopmentCard;
    return {
        canRollDice:
            game.phase === "playing" &&
            !hasRolled,
        canTrade,
        canRoad:
            game.phase === "playing" &&
            hasRolled &&
            canRoad,
        canSettlement:
            game.phase === "playing" &&
            hasRolled &&
            canSettlement,
        canCity:
            game.phase === "playing" &&
            hasRolled &&
            canCity,
        canBuyDevelopmentCard:
            game.phase === "playing" &&
            hasRolled &&
            canBuyDevelopmentCard,
        canPlayDevelopmentCard,
        canEndTurn:
            game.phase === "playing" &&
            hasRolled,
    };
}