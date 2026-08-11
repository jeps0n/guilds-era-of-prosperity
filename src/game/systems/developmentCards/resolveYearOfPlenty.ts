import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
export function resolveYearOfPlenty(
    game: GameState,
    playerId: string,
    firstResource: keyof Resources,
    secondResource: keyof Resources
): GameState {
    if (game.phase !== "playing") {
        return game;
    }
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    if (!game.yearOfPlentyPending) {
        return game;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    const resourceBank = game.resourceBank;
    if (resourceBank[firstResource] < 1) {
        return game;
    }
    if (resourceBank[secondResource] < 1) {
        return game;
    }
    const updatedPlayers = game.players.map(
        (candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            return {
                ...candidate,
                resources: {
                    ...candidate.resources,
                    [firstResource]:
                        candidate.resources[firstResource] +
                        1 +
                        (firstResource === secondResource ? 1 : 0),
                    [secondResource]:
                        firstResource === secondResource
                            ? candidate.resources[secondResource] + 2
                            : candidate.resources[secondResource] + 1,
                },
                developmentCardPlayedThisTurn: true,
                playedDevelopmentCardIds: [
                    ...candidate.playedDevelopmentCardIds,
                    game.yearOfPlentyCardId!,
                ],
            };
        }
    );
    const updatedResourceBank = {
        ...resourceBank,
        [firstResource]:
            resourceBank[firstResource] -
            (firstResource === secondResource ? 2 : 1),
        [secondResource]:
            firstResource === secondResource
                ? resourceBank[secondResource]
                : resourceBank[secondResource] - 1,
    };
    return {
        ...game,
        players: updatedPlayers,
        resourceBank: updatedResourceBank,
        yearOfPlentyPending: false,
        yearOfPlentyCardId: undefined,
        yearOfPlentyFirstResource: undefined,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "DEVELOPMENT_CARD_PLAYED",
                `${player.name} received [${firstResource}] 1 and [${secondResource}] 1 from Year of Plenty.`
            ),
        ],
    };
}