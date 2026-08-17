import type { GameState } from "../../engine/GameState";
export function hasPlayableKnight(
    game: GameState,
    playerId: string
): boolean {
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return false;
    }
    if (player.developmentCardPlayedThisTurn) {
        return false;
    }
    return player.developmentCards.some(
        (card) =>
            card.type === "knight" &&
            !player.developmentCardsPurchasedThisTurn.includes(
                card.id
            ) &&
            !player.playedDevelopmentCardIds.includes(
                card.id
            )
    );
}