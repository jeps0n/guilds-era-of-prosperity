import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
export function resolveMonopoly(
    game: GameState,
    playerId: string,
    resource: keyof Resources
): GameState {
    if (game.phase !== "playing") {
        return game;
    }
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    if (!game.monopolyPending) {
        return game;
    }
    if (!game.monopolyCardId) {
        return game;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    const card = player.developmentCards.find(
        (candidate) =>
            candidate.id === game.monopolyCardId
    );
    if (!card || card.type !== "monopoly") {
        return game;
    }
    // Collect all of the selected resource from every opponent.
    const totalCollected = game.players.reduce(
        (total, candidate) => {
            if (candidate.id === playerId) {
                return total;
            }
            return total + candidate.resources[resource];
        },
        0
    );
    const updatedPlayers = game.players.map(
        (candidate) => {
            if (candidate.id === playerId) {
                return {
                    ...candidate,
                    resources: {
                        ...candidate.resources,
                        [resource]:
                            candidate.resources[resource] +
                            totalCollected,
                    },
                    developmentCardPlayedThisTurn:
                        true,
                    playedDevelopmentCardIds:
                        candidate.playedDevelopmentCardIds.includes(
                            card.id
                        )
                            ? candidate.playedDevelopmentCardIds
                            : [
                                ...candidate.playedDevelopmentCardIds,
                                card.id,
                            ],
                };
            }
            return {
                ...candidate,
                resources: {
                    ...candidate.resources,
                    [resource]: 0,
                },
            };
        }
    );
    return {
        ...game,
        players: updatedPlayers,
        monopolyPending: false,
        monopolyCardId: undefined,
        monopolyResource: undefined,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "DEVELOPMENT_CARD_PLAYED",
                `${player.name} played a Monopoly card.`
            ),
            createEvent(
                "MONOPOLY_RESOLVED",
                `${player.name} collected [${resource}] ${totalCollected}.`
            ),
        ],
    };
}