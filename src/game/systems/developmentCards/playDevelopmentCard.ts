import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
export function playDevelopmentCard(
    game: GameState,
    playerId: string,
    cardId: string
): GameState {
    if (game.phase !== "playing") {
        return game;
    }
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    if (game.lastDiceRoll === undefined) {
        return game;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    // Catan rule: only one development card may be played per turn.
    if (player.developmentCardPlayedThisTurn) {
        return game;
    }
    const card = player.developmentCards.find(
        (candidate) => candidate.id === cardId
    );
    if (!card) {
        return game;
    }
    // A development card purchased this turn cannot be played this turn.
    if (
        player.developmentCardsPurchasedThisTurn.includes(
            card.id
        )
    ) {
        return game;
    }
    // A card can only be played once.
    if (
        player.playedDevelopmentCardIds.includes(
            card.id
        )
    ) {
        return game;
    }
    // Victory Point cards are revealed/scored by ownership.
    // They are not manually played.
    if (card.type === "victory_point") {
        return game;
    }
    const updatedPlayers = game.players.map(
        (candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            return {
                ...candidate,
                developmentCardPlayedThisTurn: true,
                playedDevelopmentCardIds: [
                    ...candidate.playedDevelopmentCardIds,
                    card.id,
                ],
                knightsPlayed:
                    card.type === "knight"
                        ? candidate.knightsPlayed + 1
                        : candidate.knightsPlayed,
            };
        }
    );
    return {
        ...game,
        players: updatedPlayers,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "DEVELOPMENT_CARD_PLAYED",
                `${player.name} played a ${card.type.replaceAll("_", " ")} card.`
            ),
        ],
    };
}