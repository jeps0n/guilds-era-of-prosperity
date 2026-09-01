import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { getEffectiveCityCost } from "../../guilds/builder/passive/getEffectiveCityCost";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
type Resource = keyof Resources;
// Standard cost of City
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
    // City can only be built during play.
    if (game.phase !== "playing") {
        return game;
    }
    // Only the current player can build.
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    // Block building during pending actions.
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
    // Master Builder super can build city before the dice roll.
    const isMasterBuilderCity =
        game.masterBuilderPending &&
        game.masterBuilderSelection === "city";
    // Normal city built/placed requires a dice roll.
    if (
        game.lastDiceRoll === undefined &&
        !isMasterBuilderCity
    ) {
        return game;
    }
    // Find the player.
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    // Invalid player.
    if (!player) {
        return game;
    }
    // Enforce the four-city limit.
    if (player.cities.length >= 4) {
        return game;
    }
    // A city must replace the player's settlement.
    const settlement = player.settlements.find(
        (candidate) => candidate.nodeId === nodeId
    );
    // No settlement means no city placement.
    if (!settlement) {
        return game;
    }
    // Check Builder passive availability.
    const isBuilder =
        player.guild === "builder";
    const builderPassiveAvailable =
        isBuilder &&
        !player.guildPassiveUsedThisTurn;
    // Master Builder Passive makes the city free.
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
    // Validate the Builder discount for a normal city build.
    if (!isMasterBuilderCity) {
        // The discount must use a city resource.
        if (
            builderPassiveAvailable &&
            discountedResource !== undefined &&
            !CITY_RESOURCES.includes(
                discountedResource
            )
        ) {
            return game;
        }
        // Builder must choose the discounted resource.
        if (
            builderPassiveAvailable &&
            discountedResource === undefined
        ) {
            return game;
        }
        // Check the effective city cost.
        if (
            player.resources.ore < cityCost.ore ||
            player.resources.wheat < cityCost.wheat
        ) {
            return game;
        }
    }
    // Remove the settlement being upgraded.
    const updatedSettlements =
        player.settlements.filter(
            (candidate) =>
                candidate.nodeId !== nodeId
        );
    // Add the city.
    const updatedCities = [
        ...player.cities,
        nodeId,
    ];
    // Master Builder does not consume the Builder Passive.
    const usesBuilderPassive =
        !isMasterBuilderCity &&
        builderPassiveAvailable &&
        discountedResource !== undefined;
    // Update the player.
    const updatedPlayers =
        game.players.map((candidate) => {
            // Leave other players unchanged.
            if (candidate.id !== playerId) {
                return candidate;
            }
            return {
                ...candidate,
                // Pay the city cost.
                resources: {
                    ...candidate.resources,
                    ore:
                        candidate.resources.ore -
                        cityCost.ore,
                    wheat:
                        candidate.resources.wheat -
                        cityCost.wheat,
                },
                // Replace the settlement with a city.
                settlements:
                    updatedSettlements,
                cities:
                    updatedCities,
                // Consume the Builder Passive when used.
                guildPassiveUsedThisTurn:
                    usesBuilderPassive
                        ? true
                        : candidate.guildPassiveUsedThisTurn,
                // Award one VP.
                vp: candidate.vp + 1,
            };
        });
    // Return paid resources to the bank.
    const updatedResourceBank = {
        ...game.resourceBank,
        ore:
            game.resourceBank.ore +
            cityCost.ore,
        wheat:
            game.resourceBank.wheat +
            cityCost.wheat,
    };
    // Build the updated game state.
    return evaluateMilestones({
        ...game,
        // Save the updated players.
        players: updatedPlayers,
        // Save the updated resource bank.
        resourceBank:
            updatedResourceBank,
        // Clear Master Builder after use.
        masterBuilderPending:
            isMasterBuilderCity
                ? false
                : game.masterBuilderPending,
        masterBuilderSelection:
            isMasterBuilderCity
                ? undefined
                : game.masterBuilderSelection,
        // Record the build event.
        eventLog: [
            ...game.eventLog,
            createEvent(
                "CITY_BUILT",
                isMasterBuilderCity
                    ? `${player.name} built a City using Master Builder. (+1 VP)`
                    : usesBuilderPassive
                        ? `${player.name} built a City using the Builder Passive. (+1 VP)`
                        : `${player.name} built a City. (+1 VP)`
            ),
        ],
    });
}
export function hasLegalCityPlacement(
    game: GameState,
    playerId: string
): boolean {
    // Cities can only be checked during play.
    if (game.phase !== "playing") {
        return false;
    }
    // Only the current player can build.
    if (game.currentPlayerId !== playerId) {
        return false;
    }
    // Pending robber actions block placement.
    if (game.robberPending) {
        return false;
    }
    // Dice roll is not required because Master Builder
    // can be selected before the roll.
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    // Invalid player.
    if (!player) {
        return false;
    }
    // Enforce the four-city limit.
    if (player.cities.length >= 4) {
        return false;
    }
    // A city requires at least one settlement.
    return player.settlements.length > 0;
}