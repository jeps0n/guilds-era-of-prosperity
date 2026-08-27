import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
import { getEffectiveRoadCost } from "../../guilds/explorer/passive/getEffectiveRoadCost";
type Resource = keyof Resources;
// Standard cost of Road
const ROAD_RESOURCES: Resource[] = [
    "brick",
    "lumber",
];
export function buildRoad(
    game: GameState,
    playerId: string,
    edgeId: string,
    keepResource?: Resource
): GameState {
    // Roads can only be built during play.
    if (game.phase !== "playing") {
        return game;
    }
    // Only the current player can build.
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    // Grand Expedition super can place roads before the roll.
    // All other roads built/placed must be after the roll.
    if (
        game.lastDiceRoll === undefined &&
        !game.grandExpeditionPending
    ) {
        return game;
    }
    // No road can be built while the robber of Master Builder is waiting for a resolution.
    if (
        game.robberPending ||
        game.masterBuilderPending
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
    // Enforce the 15-road limit.
    if (player.roads.length >= 15) {
        return game;
    }
    // Road Building (dev card) provides free roads.
    const isRoadBuilding =
        game.roadBuildingPending;
    // Grand Expedition (super) provides free roads.
    const isGrandExpedition =
        game.grandExpeditionPending;
    // Either effect makes the road free.
    const isFreeRoadPlacement =
        isRoadBuilding ||
        isGrandExpedition;
    // Resources paid for this road.
    let paymentResources: Resource[] = [];
    // Skip payment for free roads.
    if (!isFreeRoadPlacement) {
        // Explorer gets a discounted road cost once per turn.
        if (
            player.guild === "explorer" &&
            !player.guildPassiveUsedThisTurn
        ) {
            // Calculate the Explorer road cost.
            const effectiveRoadCost =
                getEffectiveRoadCost(
                    player,
                    keepResource
                );
            // Stop if the required resource choice is missing.
            if (!effectiveRoadCost) {
                return game;
            }
            paymentResources =
                effectiveRoadCost;
        } else {
            // Everyone else pays the normal road cost.
            // This includes an Explorer whose passive was already used.
            paymentResources = ROAD_RESOURCES;
        }
        // Check that the player can afford the road.
        for (const resource of paymentResources) {
            if (player.resources[resource] < 1) {
                return game;
            }
        }
    }
    // Find the target edge.
    const edge = game.board.edges.find(
        (candidate) => candidate.id === edgeId
    );
    // Invalid edge.
    if (!edge) {
        return game;
    }
    // Prevent building on an occupied edge.
    const edgeAlreadyOccupied =
        game.players.some(
            (candidate) =>
                candidate.roads.includes(edgeId)
        );
    if (edgeAlreadyOccupied) {
        return game;
    }
    // The road must connect to the player's network.
    if (
        !connectsToPlayerNetwork(
            game,
            playerId,
            edgeId
        )
    ) {
        return game;
    }
    // Free roads do not consume the Explorer passive.
    const usesExplorerPassive =
        !isFreeRoadPlacement &&
        player.guild === "explorer" &&
        !player.guildPassiveUsedThisTurn;
    // Update the player.
    const updatedPlayers =
        game.players.map((candidate) => {
            // Leave other players unchanged.
            if (candidate.id !== playerId) {
                return candidate;
            }
            // Copy resources before payment.
            const updatedResources = {
                ...candidate.resources,
            };
            // Pay the road cost.
            for (const resource of paymentResources) {
                updatedResources[resource] -= 1;
            }
            return {
                ...candidate,
                // Save the updated resources.
                resources: updatedResources,
                // Add the new road.
                roads: [
                    ...candidate.roads,
                    edgeId,
                ],
                // Consume the Explorer passive when used.
                guildPassiveUsedThisTurn:
                    usesExplorerPassive
                        ? true
                        : candidate.guildPassiveUsedThisTurn,
            };
        });
    // Copy the resource bank.
    const updatedResourceBank = {
        ...game.resourceBank,
    };
    // Return paid resources to the bank.
    for (const resource of paymentResources) {
        updatedResourceBank[resource] += 1;
    }
    // Record the road placement.
    const roadPlacedEvent = createEvent(
        "ROAD_PLACED",
        isFreeRoadPlacement
            ? isRoadBuilding
                ? `${player.name} built a Road using Road Building.`
                : `${player.name} built a Road using Grand Expedition.`
            : usesExplorerPassive
                ? `${player.name} built a Road using the Explorer Passive.`
                : `${player.name} built a Road.`
    );
    // Build the updated game state.
    const updatedGame: GameState = {
        ...game,
        // Save the updated players.
        players: updatedPlayers,
        // Save the updated resource bank.
        resourceBank: updatedResourceBank,
        // Track Road Building placements.
        roadBuildingRoadsPlaced:
            isRoadBuilding
                ? game.roadBuildingRoadsPlaced + 1
                : game.roadBuildingRoadsPlaced,
        // Add the event to the log.
        eventLog: [
            ...game.eventLog,
            roadPlacedEvent,
        ],
    };
    // Recalculate Longest Road.
    const longestRoadUpdatedGame =
        updateLongestRoad(updatedGame);
    // Grand Expedition can place multiple roads.
    if (isGrandExpedition) {
        // Count the road toward the Super.
        const roadsPlaced =
            game.grandExpeditionRoadsPlaced + 1;
        // End the Super when all roads are placed.
        if (
            roadsPlaced >=
            game.grandExpeditionRoadsToPlace
        ) {
            return evaluateMilestones({
                ...longestRoadUpdatedGame,
                // Clear Grand Expedition state.
                grandExpeditionPending: false,
                grandExpeditionRoadsPlaced: 0,
                grandExpeditionRoadsToPlace: 0,
            });
        }
        // Check for another legal road.
        const hasAnotherLegalRoad =
            hasLegalRoadPlacement(
                longestRoadUpdatedGame,
                playerId
            );
        // Continue only if another road is available.
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            // Save the number of roads placed.
            grandExpeditionRoadsPlaced:
                roadsPlaced,
            // Keep the Super active when possible.
            grandExpeditionPending:
                hasAnotherLegalRoad,
        });
    }
    // Normal roads finish immediately.
    if (!isRoadBuilding) {
        return evaluateMilestones(
            longestRoadUpdatedGame
        );
    }
    // Find the updated player.
    const updatedPlayer =
        longestRoadUpdatedGame.players.find(
            (candidate) =>
                candidate.id === playerId
        );
    // Invalid updated player.
    if (!updatedPlayer) {
        return game;
    }
    // Stop Road Building at the road limit.
    if (updatedPlayer.roads.length >= 15) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            // End Road Building.
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    // Road Building allows two roads.
    if (
        longestRoadUpdatedGame.roadBuildingRoadsPlaced >= 2
    ) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            // End Road Building.
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    // Check for another legal road.
    const hasSecondLegalRoad =
        hasLegalRoadPlacement(
            longestRoadUpdatedGame,
            playerId
        );
    // Continue only if another road is available.
    return evaluateMilestones({
        ...longestRoadUpdatedGame,
        roadBuildingPending: hasSecondLegalRoad,
    });
}
// Check whether at least one legal road exists.
export function hasLegalRoadPlacement(
    game: GameState,
    playerId: string
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
    // Enforce the road limit.
    if (player.roads.length >= 15) {
        return false;
    }
    // Find an unoccupied connected edge.
    return game.board.edges.some((edge) => {
        // Check whether the edge is occupied.
        const occupied =
            game.players.some(
                (candidate) =>
                    candidate.roads.includes(edge.id)
            );
        // Occupied edges are unavailable.
        if (occupied) {
            return false;
        }
        // The edge must connect to the player's network.
        return connectsToPlayerNetwork(
            game,
            playerId,
            edge.id
        );
    });
}
// Check whether an edge connects to the player's network.
function connectsToPlayerNetwork(
    game: GameState,
    playerId: string,
    edgeId: string
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
    // Find the candidate edge.
    const candidateEdge =
        game.board.edges.find(
            (edge) => edge.id === edgeId
        );
    // Invalid edge.
    if (!candidateEdge) {
        return false;
    }
    // Collect the player's structures.
    const playerStructureNodes = new Set([
        ...player.settlements.map(
            (settlement) =>
                settlement.nodeId
        ),
        ...player.cities,
    ]);
    // Collect opponent structures.
    const opponentStructureNodes = new Set(
        game.players
            .filter(
                (candidate) =>
                    candidate.id !== playerId
            )
            .flatMap((candidate) => [
                ...candidate.settlements.map(
                    (settlement) =>
                        settlement.nodeId
                ),
                ...candidate.cities,
            ])
    );
    // Check both ends of the candidate edge.
    const candidateNodes = [
        candidateEdge.nodeA,
        candidateEdge.nodeB,
    ];
    for (const nodeId of candidateNodes) {
        // The player's structure connects directly.
        if (
            playerStructureNodes.has(nodeId)
        ) {
            return true;
        }
        // An opponent structure blocks the network.
        if (
            opponentStructureNodes.has(nodeId)
        ) {
            continue;
        }
        // Look for the player's connected road.
        const connectedToPlayerRoad =
            game.board.edges.some((edge) => {
                // Skip the candidate edge.
                if (
                    edge.id ===
                    candidateEdge.id
                ) {
                    return false;
                }
                // Only the player's roads count.
                if (
                    !player.roads.includes(
                        edge.id
                    )
                ) {
                    return false;
                }
                // The road must touch this node.
                return (
                    edge.nodeA === nodeId ||
                    edge.nodeB === nodeId
                );
            });
        // The candidate edge connects to the network.
        if (connectedToPlayerRoad) {
            return true;
        }
    }
    // Neither end connects to the network.
    return false;
}
// Calculate the maximum legal road placements.
export function getMaxLegalRoadPlacements(
    game: GameState,
    playerId: string
): number {
    // Find the player.
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    // Invalid player.
    if (!player) {
        return 0;
    }
    // Calculate remaining road pieces.
    const remainingRoads =
        15 - player.roads.length;
    // No remaining pieces.
    if (remainingRoads <= 0) {
        return 0;
    }
    // Simulate placements on a temporary game state.
    let simulatedGame = game;
    // Count simulated placements.
    let roadsPlaced = 0;
    // Continue until no placement is possible.
    while (roadsPlaced < remainingRoads) {
        // Find the next legal edge.
        const legalEdge = simulatedGame.board.edges.find(
            (edge) => {
                // Check whether the edge is occupied.
                const occupied =
                    simulatedGame.players.some(
                        (candidate) =>
                            candidate.roads.includes(edge.id)
                    );
                // Skip occupied edges.
                if (occupied) {
                    return false;
                }
                // Check network connection.
                return connectsToPlayerNetwork(
                    simulatedGame,
                    playerId,
                    edge.id
                );
            }
        );
        // Stop when no legal edge remains.
        if (!legalEdge) {
            break;
        }
        // Add the simulated road.
        simulatedGame = {
            ...simulatedGame,
            players: simulatedGame.players.map(
                (candidate) =>
                    candidate.id === playerId
                        ? {
                            ...candidate,
                            // Add the simulated road.
                            roads: [
                                ...candidate.roads,
                                legalEdge.id,
                            ],
                        }
                        : candidate
            ),
        };
        // Count the simulated placement.
        roadsPlaced += 1;
    }
    // Return the maximum legal placements.
    return roadsPlaced;
}