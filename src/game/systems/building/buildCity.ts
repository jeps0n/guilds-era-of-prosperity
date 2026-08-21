import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { getEffectiveCityCost } from "../../guilds/builder/passive/getEffectiveCityCost";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
type Resource = keyof Resources;
const CITY_RESOURCES: Resource[] = [
    "ore",
    "wheat",
];
export function buildCity(
    game: GameState,
    playerId: string,
    nodeId: string,
    discountedResource?: Resource
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
    const isBuilder =
        player.guild === "builder";
    const builderPassiveAvailable =
        isBuilder &&
        !player.guildPassiveUsedThisTurn;
    /*
     * If Builder is attempting to use the passive,
     * the discounted resource must be one of the
     * resources normally required by a city.
     */
    if (
        builderPassiveAvailable &&
        discountedResource !== undefined &&
        !CITY_RESOURCES.includes(
            discountedResource
        )
    ) {
        return game;
    }
    /*
     * A Builder with an unused passive must explicitly
     * provide the resource being discounted.
     *
     * Normal players, and Builders whose passive has
     * already been used, use the normal city cost.
     */
    if (
        builderPassiveAvailable &&
        discountedResource === undefined
    ) {
        return game;
    }
    const cityCost =
        getEffectiveCityCost(
            player,
            discountedResource
        );
    /*
     * Final affordability check against the effective
     * cost. The engine remains authoritative regardless
     * of what the UI says is affordable.
     */
    if (
        player.resources.ore < cityCost.ore ||
        player.resources.wheat < cityCost.wheat
    ) {
        return game;
    }
    const updatedSettlements =
        player.settlements.filter(
            (candidate) =>
                candidate.nodeId !== nodeId
        );
    const updatedCities = [
        ...player.cities,
        nodeId,
    ];
    /*
     * The passive is consumed only after all validation
     * succeeds and the city is actually built.
     */
    const usesBuilderPassive =
        builderPassiveAvailable &&
        discountedResource !== undefined;
    const updatedPlayers =
        game.players.map((candidate) => {
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
                settlements:
                    updatedSettlements,
                cities:
                    updatedCities,
                guildPassiveUsedThisTurn:
                    usesBuilderPassive
                        ? true
                        : candidate.guildPassiveUsedThisTurn,
                vp: candidate.vp + 1,
            };
        });
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
        resourceBank:
            updatedResourceBank,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "CITY_BUILT",
                `${player.name} upgraded a settlement to a city.`
            ),
        ],
    });
}
export function hasLegalCityPlacement(
    game: GameState,
    playerId: string
): boolean {
    if (game.phase !== "playing") {
        return false;
    }
    if (game.currentPlayerId !== playerId) {
        return false;
    }
    if (game.robberPending) {
        return false;
    }
    // if (game.lastDiceRoll === undefined) {
    //     return false;
    // }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return false;
    }
    if (player.cities.length >= 4) {
        return false;
    }
    return player.settlements.length > 0;
}