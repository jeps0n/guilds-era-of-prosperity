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
    const canRoad =
        resources.brick >= 1 &&
        resources.lumber >= 1;
    const canSettlement =
        resources.brick >= 1 &&
        resources.lumber >= 1 &&
        resources.wheat >= 1 &&
        resources.sheep >= 1;
    const canCity =
        resources.ore >= 3 &&
        resources.wheat >= 2;
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