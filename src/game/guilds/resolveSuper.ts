import type { GameState } from "../engine/GameState";
import type { Resources } from "../engine/types";
export function resolveSuper(
    game: GameState,
    playerId: string,
    selectedResources: (keyof Resources)[]
): GameState {
    if (game.phase !== "playing") {
        return game;
    }
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    if (selectedResources.length < 1 || selectedResources.length > 3) {
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
    const selectedCounts: Resources = {
        brick: 0,
        lumber: 0,
        wheat: 0,
        sheep: 0,
        ore: 0,
    };
    for (const resource of selectedResources) {
        selectedCounts[resource] += 1;
    }
    for (const resource of Object.keys(selectedCounts) as (keyof Resources)[]) {
        if (game.resourceBank[resource] < selectedCounts[resource]) {
            return game;
        }
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
                    brick:
                        candidate.resources.brick +
                        selectedCounts.brick,
                    lumber:
                        candidate.resources.lumber +
                        selectedCounts.lumber,
                    wheat:
                        candidate.resources.wheat +
                        selectedCounts.wheat,
                    sheep:
                        candidate.resources.sheep +
                        selectedCounts.sheep,
                    ore:
                        candidate.resources.ore +
                        selectedCounts.ore,
                },
            };
        }
    );
    const updatedResourceBank: Resources = {
        brick:
            game.resourceBank.brick -
            selectedCounts.brick,
        lumber:
            game.resourceBank.lumber -
            selectedCounts.lumber,
        wheat:
            game.resourceBank.wheat -
            selectedCounts.wheat,
        sheep:
            game.resourceBank.sheep -
            selectedCounts.sheep,
        ore:
            game.resourceBank.ore -
            selectedCounts.ore,
    };
    return {
        ...game,
        players: updatedPlayers,
        resourceBank: updatedResourceBank,
    };
}