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
    if (
        game.robberPending ||
        game.grandExpeditionPending ||
        game.roadBuildingPending ||
        (
            game.masterBuilderPending &&
            game.masterBuilderSelection === "settlement"
        )
    ) {
        return game;
    }
    // Master Builder is allowed to place before the dice roll.
    const isMasterBuilderCity =
        game.masterBuilderPending &&
        game.masterBuilderSelection === "city";
    // Normal city building still requires the dice roll.
    if (
        game.lastDiceRoll === undefined &&
        !isMasterBuilderCity
    ) {
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
     * Master Builder bypasses the normal Builder pricing flow.
     * Normal city pricing below remains unchanged.
     */
    const cityCost =
        isMasterBuilderCity
            ? {
                ore: 0,
                wheat: 0,
            }
            : getEffectiveCityCost(
                player,
                discountedResource
            );
    /*
     * Builder discount validation only applies
     * to a normal city build.
     */
    if (!isMasterBuilderCity) {
        /*
         * If Builder is attempting to use the passive,
         * the discounted resource must be a city resource.
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
         * An unused Builder passive requires
         * an explicit discounted resource.
         */
        if (
            builderPassiveAvailable &&
            discountedResource === undefined
        ) {
            return game;
        }
        /*
         * Final affordability check against the
         * normal/effective city cost.
         */
        if (
            player.resources.ore < cityCost.ore ||
            player.resources.wheat < cityCost.wheat
        ) {
            return game;
        }
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
     * Master Builder does not consume the Builder passive.
     */
    const usesBuilderPassive =
        !isMasterBuilderCity &&
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
        /*
         * A successful Master Builder placement
         * resolves the Super interaction.
         */
        masterBuilderPending:
            isMasterBuilderCity
                ? false
                : game.masterBuilderPending,
        masterBuilderSelection:
            isMasterBuilderCity
                ? undefined
                : game.masterBuilderSelection,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "CITY_BUILT",
                isMasterBuilderCity
                    ? `${player.name} upgraded a settlement to a city using Master Builder.`
                    : `${player.name} upgraded a settlement to a city.`
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
    // Dice roll is intentionally not checked here because
    // Master Builder may be selected before the roll.
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