import type { GameState } from "../../../engine/GameState";
import type { DevelopmentCard } from "../../../domain/DevelopmentCard";
import { createEvent } from "../../../engine/createEvent";
export function getMarketInsightCards(
    game: GameState
): DevelopmentCard[] {
    return game.developmentDeck.slice(0, 3);
}
export function resolveMarketInsight(
    game: GameState,
    playerId: string,
    selectedCardIds: string[]
): GameState {
    if (game.phase !== "playing") {
        return game;
    }
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    if (!player.superUnlocked) {
        return game;
    }
    if (player.superUsed) {
        return game;
    }
    const availableCards =
        game.developmentDeck.slice(0, 3);
    /*
     * No development cards available.
     *
     * This resolver does not consume the Super.
     * The orchestrator decides whether the overall
     * Super transaction is meaningful.
     */
    if (availableCards.length === 0) {
        return game;
    }
    let selectedCards: DevelopmentCard[];
    /*
     * Fewer than 3 cards:
     * automatically take every available card.
     */
    if (availableCards.length < 3) {
        selectedCards = availableCards;
    } else {
        /*
         * Three cards available:
         * Merchant must explicitly select exactly 2.
         */
        if (selectedCardIds.length !== 2) {
            return game;
        }
        const selectedIdSet =
            new Set(selectedCardIds);
        selectedCards = availableCards.filter((card) =>
            selectedIdSet.has(card.id)
        );
        if (selectedCards.length !== 2) {
            return game;
        }
    }
    const selectedIdSet =
        new Set(selectedCards.map((card) => card.id));
    const returnedCards = availableCards.filter(
        (card) => !selectedIdSet.has(card.id)
    );
    const remainingDeck =
        game.developmentDeck.slice(3);
    const updatedDevelopmentDeck = [
        ...returnedCards,
        ...remainingDeck,
    ];
    const updatedPlayers = game.players.map(
        (candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            const vpIncrease = selectedCards.filter(
                (card) => card.type === "victory_point"
            ).length;
            return {
                ...candidate,
                developmentCards: [
                    ...candidate.developmentCards,
                    ...selectedCards,
                ],
                vp: candidate.vp + vpIncrease,
            };
        }
    );
    return {
        ...game,
        players: updatedPlayers,
        developmentDeck: updatedDevelopmentDeck,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "SUPER_ACTIVATED",
                `${player.name} used guild super ability: MARKET INSIGHT.`
            )
        ],
    };
}