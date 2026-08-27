import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { getEffectiveSettlementCost } from "../../guilds/builder/passive/getEffectiveSettlementCost";
import { canPlaceSettlement } from "../validation/canPlaceSettlement";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
type Resource = keyof Resources;
// Standard cost of Settlement
const SETTLEMENT_RESOURCES: Resource[] = [
    "brick",
    "lumber",
    "wheat",
    "sheep",
];
export function buildSettlement(
    game: GameState,
    playerId: string,
    nodeId: string,
    discountedResource?: Resource
): GameState {
    // Settlements can only be built during play.
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
            game.masterBuilderSelection === "city"
        )
    ) {
        return game;
    }
    // Master Builder super can build settlement before the dice roll.
    const isMasterBuilderSettlement =
        game.masterBuilderPending &&
        game.masterBuilderSelection === "settlement";
    // All other settlement built/placed requires a dice roll.
    if (
        game.lastDiceRoll === undefined &&
        !isMasterBuilderSettlement
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
    // Enforce the five-settlement limit.
    if (player.settlements.length >= 5) {
        return game;
    }
    // Check Builder Passive availability.
    const isBuilder =
        player.guild === "builder";
    const builderPassiveAvailable =
        isBuilder &&
        !player.guildPassiveUsedThisTurn;
    // Master Builder makes the settlement for free.
    const settlementCost =
        isMasterBuilderSettlement
            ? {
                brick: 0,
                lumber: 0,
                wheat: 0,
                sheep: 0,
            }
            : getEffectiveSettlementCost(
                player,
                discountedResource
            );
    // Validate the Builder discount for a normal settlement build.
    if (!isMasterBuilderSettlement) {
        // The discount must use a settlement resource.
        if (
            builderPassiveAvailable &&
            discountedResource !== undefined &&
            !SETTLEMENT_RESOURCES.includes(
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
        // Check the effective settlement cost.
        if (
            player.resources.brick <
            settlementCost.brick ||
            player.resources.lumber <
            settlementCost.lumber ||
            player.resources.wheat <
            settlementCost.wheat ||
            player.resources.sheep <
            settlementCost.sheep
        ) {
            return game;
        }
    }
    // Find the target node.
    const node = game.board.nodes.find(
        (candidate) =>
            candidate.id === nodeId
    );
    // Invalid node.
    if (!node) {
        return game;
    }
    // Check settlement placement rules.
    if (!canPlaceSettlement(game, nodeId)) {
        return game;
    }
    // Settlement must connect to the player's road.
    if (
        !connectsToPlayerRoad(
            game,
            playerId,
            nodeId
        )
    ) {
        return game;
    }
    // Consume the Builder Passive only on a normal discounted build.
    const usesBuilderPassive =
        !isMasterBuilderSettlement &&
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
                // Pay the settlement cost.
                resources: {
                    ...candidate.resources,
                    brick:
                        candidate.resources.brick -
                        settlementCost.brick,
                    lumber:
                        candidate.resources.lumber -
                        settlementCost.lumber,
                    wheat:
                        candidate.resources.wheat -
                        settlementCost.wheat,
                    sheep:
                        candidate.resources.sheep -
                        settlementCost.sheep,
                },
                // Add the settlement.
                settlements: [
                    ...candidate.settlements,
                    {
                        id: `settlement-${candidate.settlements.length + 1}`,
                        playerId,
                        nodeId,
                    },
                ],
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
        brick:
            game.resourceBank.brick +
            settlementCost.brick,
        lumber:
            game.resourceBank.lumber +
            settlementCost.lumber,
        wheat:
            game.resourceBank.wheat +
            settlementCost.wheat,
        sheep:
            game.resourceBank.sheep +
            settlementCost.sheep,
        ore:
            game.resourceBank.ore,
    };
    // Build the updated game state.
    const updatedGame: GameState = {
        ...game,
        // Save the updated players.
        players: updatedPlayers,
        // Save the updated resource bank.
        resourceBank:
            updatedResourceBank,
        // Track the last settlement placement.
        lastPlacedSettlementNodeId:
            nodeId,
        // Record the build event.
        eventLog: [
            ...game.eventLog,
            createEvent(
                "SETTLEMENT_BUILT",
                isMasterBuilderSettlement
                    ? `${player.name} built a Settlement using Master Builder. (+1VP)`
                    : usesBuilderPassive
                        ? `${player.name} built a Settlement using the Builder Passive. (+1VP)`
                        : `${player.name} built a Settlement. (+1VP)`
            ),
        ],
    };
    // Recalculate Longest Road.
    const longestRoadUpdatedGame =
        updateLongestRoad(updatedGame);
    // Resolve the settlement build.
    return evaluateMilestones({
        ...longestRoadUpdatedGame,
        // Clear Master Builder after use.
        masterBuilderPending:
            isMasterBuilderSettlement
                ? false
                : longestRoadUpdatedGame.masterBuilderPending,
        masterBuilderSelection:
            isMasterBuilderSettlement
                ? undefined
                : longestRoadUpdatedGame.masterBuilderSelection,
    });
}
// Check whether a node connects to the player's road.
function connectsToPlayerRoad(
    game: GameState,
    playerId: string,
    nodeId: string
): boolean {
    // Find the player.
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    // Invalid player.
    if (!player) {
        return false;
    }
    // Find a player's road touching the node.
    return game.board.edges.some((edge) => {
        if (
            edge.nodeA !== nodeId &&
            edge.nodeB !== nodeId
        ) {
            return false;
        }
        return player.roads.includes(edge.id);
    });
}
export function hasLegalSettlementPlacement(
    game: GameState,
    playerId: string
): boolean {
    // Settlements can only be checked during play.
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
    // Find the player.
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    // Invalid player.
    if (!player) {
        return false;
    }
    // Enforce the five-settlement limit.
    if (player.settlements.length >= 5) {
        return false;
    }
    // Find a legal connected node.
    return game.board.nodes.some((node) => {
        // Check settlement placement rules.
        if (!canPlaceSettlement(game, node.id)) {
            return false;
        }
        // Check road connection.
        return connectsToPlayerRoad(
            game,
            playerId,
            node.id
        );
    });
}