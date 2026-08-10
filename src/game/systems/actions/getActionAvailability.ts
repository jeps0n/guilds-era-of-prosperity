import type { GameState } from "../../engine/GameState";
export interface ActionAvailability {
    canRollDice: boolean;
    canTrade: boolean;
    canRoad: boolean;
    canSettlement: boolean;
    canCity: boolean;
    canBuyDevelopmentCard: boolean;
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
    const canBuyDevelopmentCard =
        resources.ore >= 1 &&
        resources.wheat >= 1 &&
        resources.sheep >= 1 &&
        game.developmentDeck.length > 0;
    const hasRolled =
        game.lastDiceRoll !== undefined;
    const canTrade =
        game.phase === "playing" &&
        hasRolled;
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
        canEndTurn:
            game.phase === "playing" &&
            hasRolled,
    };
}