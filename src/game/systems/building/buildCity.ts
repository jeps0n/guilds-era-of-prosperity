import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { getEffectiveCityCost } from "../../guilds/builder/passive/getEffectiveCityCost";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
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
    if (game.robberPending) {
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
    const settlement = player.settlements.find(
        (candidate) => candidate.nodeId === nodeId
    );
    if (!settlement) {
        return game;
    }
    const cityCost = getEffectiveCityCost(player);
    if (
        player.resources.ore < cityCost.ore ||
        player.resources.wheat < cityCost.wheat
    ) {
        return game;
    }
    const updatedSettlements =
        player.settlements.filter(
            (candidate) => candidate.nodeId !== nodeId
        );
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
                        cityCost.ore,
                    wheat:
                        candidate.resources.wheat -
                        cityCost.wheat,
                },
                settlements: updatedSettlements,
                cities: updatedCities,
                guildPassiveUsedThisTurn:
                    candidate.guild === "builder" &&
                    !candidate.guildPassiveUsedThisTurn
                        ? true
                        : candidate.guildPassiveUsedThisTurn,
                vp: candidate.vp + 1,
            };
        }
    );
    const updatedResourceBank = {
        ...game.resourceBank,
        ore:
            game.resourceBank.ore +
            cityCost.ore,
        wheat:
            game.resourceBank.wheat +
            cityCost.wheat,
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