import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
const CITY_COST = {
    ore: 3,
    wheat: 2,
};
export function buildCity(
    game: GameState,
    playerId: string,
    nodeId: string
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
    if (player.cities.length >= 4) {
        return game;
    }
    // The node must contain one of this player's settlements.
    const settlement = player.settlements.find(
        (candidate) => candidate.nodeId === nodeId
    );
    if (!settlement) {
        return game;
    }
    // Player must be able to afford the city.
    if (
        player.resources.ore < CITY_COST.ore ||
        player.resources.wheat < CITY_COST.wheat
    ) {
        return game;
    }
    // Remove the settlement being upgraded.
    const updatedSettlements = player.settlements.filter(
        (candidate) => candidate.nodeId !== nodeId
    );
    // Add the city at the same node.
    const updatedCities = [
        ...player.cities,
        nodeId,
    ];
    const updatedPlayers = game.players.map(
        (candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            return {
                ...candidate,
                resources: {
                    ...candidate.resources,
                    ore:
                        candidate.resources.ore -
                        CITY_COST.ore,
                    wheat:
                        candidate.resources.wheat -
                        CITY_COST.wheat,
                },
                settlements: updatedSettlements,
                cities: updatedCities,
                // Settlement = 1 VP
                // City = 2 VP
                // Therefore upgrading adds +1 VP.
                vp: candidate.vp + 1,
            };
        }
    );
    const updatedResourceBank = {
        ...game.resourceBank,
        ore:
            game.resourceBank.ore +
            CITY_COST.ore,
        wheat:
            game.resourceBank.wheat +
            CITY_COST.wheat,
    };
    return evaluateMilestones({
        ...game,
        players: updatedPlayers,
        resourceBank: updatedResourceBank,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "CITY_BUILT",
                `${player.name} upgraded a settlement to a city.`
            ),
        ],
    });
}