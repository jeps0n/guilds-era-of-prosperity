import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
import { getEffectiveRoadCost } from "../../guilds/explorer/passive/getEffectiveRoadCost";
type Resource = keyof Resources;
// Normal road cost: 1 brick + 1 lumber.
const ROAD_COST: Resource[] = [
    "brick",
    "lumber",
];
export function buildRoad(
    game: GameState,
    playerId: string,
    edgeId: string,
    keepResource?: Resource
): GameState {
    // Roads can only be built while the game is being played.
    if (game.phase !== "playing") {
        return game;
    }
    // Only the current player can build a road.
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    // Normal road building requires a dice roll.
    // Grand Expedition an exception because it is a SUPER and can happen before the roll.
    if (
        game.lastDiceRoll === undefined &&
        !game.grandExpeditionPending
    ) {
        return game;
    }
    // No road can be built while the robber is waiting for a resolution.
    if (game.robberPending) {
        return game;
    }
    // Find the player attempting to build the road.
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    // Stop if the player does not exist.
    if (!player) {
        return game;
    }
    // A player cannot have more than 15 roads.
    if (player.roads.length >= 15) {
        return game;
    }
    // Road Building gives free roads.
    const isRoadBuilding =
        game.roadBuildingPending;
    // Grand Expedition also gives free roads.
    const isGrandExpedition =
        game.grandExpeditionPending;
    // Either of these effects makes the current road free.
    const isFreeRoadPlacement =
        isRoadBuilding ||
        isGrandExpedition;
    // Resources that will actually be paid for this road.
    let paymentResources: Resource[] = [];
    // Free roads skip all normal payment logic.
    if (!isFreeRoadPlacement) {
        // Explorer gets a special discounted road cost once per turn.
        if (
            player.guild === "explorer" &&
            !player.guildPassiveUsedThisTurn
        ) {
            // Calculate which resource(s) the Explorer must pay.
            // keepResource is used when the Explorer had both resources
            // and had to choose which one to keep.
            const effectiveRoadCost =
                getEffectiveRoadCost(
                    player,
                    keepResource
                );
            // No cost means the Explorer cannot complete the payment
            // yet, usually because a required resource choice is missing.
            if (!effectiveRoadCost) {
                return game;
            }
            // Use the Explorer's discounted cost.
            paymentResources =
                effectiveRoadCost;
        } else {
            // Everyone else pays the normal road cost.
            // This also applies to an Explorer whose passive was already used.
            paymentResources = ROAD_COST;
        }
        // Make sure the player can afford every required resource.
        for (const resource of paymentResources) {
            if (player.resources[resource] < 1) {
                return game;
            }
        }
    }
    // Find the board edge the player wants to build on.
    const edge = game.board.edges.find(
        (candidate) => candidate.id === edgeId
    );
    // Stop if the edge does not exist.
    if (!edge) {
        return game;
    }
    // A road cannot be placed on an already occupied edge.
    const edgeAlreadyOccupied =
        game.players.some(
            (candidate) =>
                candidate.roads.includes(edgeId)
        );
    if (edgeAlreadyOccupied) {
        return game;
    }
    // The road must connect to the player's existing network.
    if (
        !connectsToPlayerNetwork(
            game,
            playerId,
            edgeId
        )
    ) {
        return game;
    }
    // The Explorer passive is used only by a normal discounted road.
    // Free roads do not consume the passive.
    const usesExplorerPassive =
        !isFreeRoadPlacement &&
        player.guild === "explorer" &&
        !player.guildPassiveUsedThisTurn;
    // Update the player who built the road.
    const updatedPlayers =
        game.players.map((candidate) => {
            // Leave every other player unchanged.
            if (candidate.id !== playerId) {
                return candidate;
            }
            // Copy the player's resources before changing them.
            const updatedResources = {
                ...candidate.resources,
            };
            // Pay each resource required for the road.
            for (const resource of paymentResources) {
                updatedResources[resource] -= 1;
            }
            return {
                ...candidate,
                // Remove the resources that were paid.
                resources: updatedResources,
                // Add the new road to the player's roads.
                roads: [
                    ...candidate.roads,
                    edgeId,
                ],
                // Consume the Explorer passive only when appropriate.
                guildPassiveUsedThisTurn:
                    usesExplorerPassive
                        ? true
                        : candidate.guildPassiveUsedThisTurn,
            };
        });
    // Copy the resource bank before changing it.
    const updatedResourceBank = {
        ...game.resourceBank,
    };
    // Return paid resources to the bank.
    for (const resource of paymentResources) {
        updatedResourceBank[resource] += 1;
    }
    // Record the road placement in the event log.
    const roadPlacedEvent = createEvent(
        "ROAD_PLACED",
        isFreeRoadPlacement
            ? isRoadBuilding
                ? `${player.name} built a road using Road Building.`
                : `${player.name} built a road using Grand Expedition.`
            : `${player.name} built a road.`
    );
    // Build the new game state with the updated player, bank, and log.
    const updatedGame: GameState = {
        ...game,
        // Save the updated players.
        players: updatedPlayers,
        // Save the updated resource bank.
        resourceBank: updatedResourceBank,
        // Count roads placed by Road Building.
        roadBuildingRoadsPlaced:
            isRoadBuilding
                ? game.roadBuildingRoadsPlaced + 1
                : game.roadBuildingRoadsPlaced,
        // Add the road placement to the event history.
        eventLog: [
            ...game.eventLog,
            roadPlacedEvent,
        ],
    };
    // Recalculate Longest Road after the new road is placed.
    const longestRoadUpdatedGame =
        updateLongestRoad(updatedGame);
    // Grand Expedition may allow multiple free roads in one activation.
    if (isGrandExpedition) {
        // Count this road toward the Grand Expedition total.
        const roadsPlaced =
            game.grandExpeditionRoadsPlaced + 1;
        // End Grand Expedition when all required roads are placed.
        if (
            roadsPlaced >=
            game.grandExpeditionRoadsToPlace
        ) {
            return evaluateMilestones({
                ...longestRoadUpdatedGame,
                // Clear the Grand Expedition state.
                grandExpeditionPending: false,
                grandExpeditionRoadsPlaced: 0,
                grandExpeditionRoadsToPlace: 0,
            });
        }
        // Check whether another legal road can still be placed.
        const hasAnotherLegalRoad =
            hasLegalRoadPlacement(
                longestRoadUpdatedGame,
                playerId
            );
        // Keep Grand Expedition active only if another legal road exists.
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            // Save the number of Grand Expedition roads placed.
            grandExpeditionRoadsPlaced:
                roadsPlaced,
            // Continue only when another legal road is available.
            grandExpeditionPending:
                hasAnotherLegalRoad,
        });
    }
    // A normal road is finished immediately after placement.
    if (!isRoadBuilding) {
        return evaluateMilestones(
            longestRoadUpdatedGame
        );
    }
    // Find the player after the Road Building update.
    const updatedPlayer =
        longestRoadUpdatedGame.players.find(
            (candidate) =>
                candidate.id === playerId
        );
    // Stop if the updated player cannot be found.
    if (!updatedPlayer) {
        return game;
    }
    // Stop Road Building if the player has reached the 15-road limit.
    if (updatedPlayer.roads.length >= 15) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            // End Road Building.
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    // Road Building allows a maximum of two roads.
    if (
        longestRoadUpdatedGame.roadBuildingRoadsPlaced >= 2
    ) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            // End Road Building after the second road.
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    // Check whether the player has another legal road.
    const hasSecondLegalRoad =
        hasLegalRoadPlacement(
            longestRoadUpdatedGame,
            playerId
        );
    // Continue Road Building only if another legal road exists.
    return evaluateMilestones({
        ...longestRoadUpdatedGame,
        roadBuildingPending: hasSecondLegalRoad,
    });
}
// Returns true when the player has at least one legal road placement.
export function hasLegalRoadPlacement(
    game: GameState,
    playerId: string
): boolean {
    // Find the player checking for a legal road.
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    // A missing player has no legal placement.
    if (!player) {
        return false;
    }
    // A player at the road limit cannot place another road.
    if (player.roads.length >= 15) {
        return false;
    }
    // Look for at least one unoccupied edge connected to the player.
    return game.board.edges.some((edge) => {
        // Check whether another player already owns this edge.
        const occupied =
            game.players.some(
                (candidate) =>
                    candidate.roads.includes(edge.id)
            );
        // Occupied edges cannot be used.
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
// Checks whether a specific edge legally connects to the player's network.
function connectsToPlayerNetwork(
    game: GameState,
    playerId: string,
    edgeId: string
): boolean {
    // Find the player whose network is being checked.
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    // A missing player has no network.
    if (!player) {
        return false;
    }
    // Find the edge being checked.
    const candidateEdge =
        game.board.edges.find(
            (edge) => edge.id === edgeId
        );
    // An invalid edge cannot connect to the network.
    if (!candidateEdge) {
        return false;
    }
    // Collect all nodes containing the player's settlements or cities.
    const playerStructureNodes = new Set([
        ...player.settlements.map(
            (settlement) =>
                settlement.nodeId
        ),
        ...player.cities,
    ]);
    // Collect all nodes containing opponents' settlements or cities.
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
    // A road can connect through either end of the edge.
    const candidateNodes = [
        candidateEdge.nodeA,
        candidateEdge.nodeB,
    ];
    // Check both ends of the candidate edge.
    for (const nodeId of candidateNodes) {
        // A player's own structure directly connects the road.
        if (
            playerStructureNodes.has(nodeId)
        ) {
            return true;
        }
        // An opponent's structure blocks the player's road network
        // from continuing through this node.
        if (
            opponentStructureNodes.has(nodeId)
        ) {
            continue;
        }
        // Look for one of the player's existing roads connected to this node.
        const connectedToPlayerRoad =
            game.board.edges.some((edge) => {
                // Do not compare the candidate edge to itself.
                if (
                    edge.id ===
                    candidateEdge.id
                ) {
                    return false;
                }
                // Only the player's roads can connect their network.
                if (
                    !player.roads.includes(
                        edge.id
                    )
                ) {
                    return false;
                }
                // The existing road must touch this node.
                return (
                    edge.nodeA === nodeId ||
                    edge.nodeB === nodeId
                );
            });
        // The candidate edge connects to the player's existing road.
        if (connectedToPlayerRoad) {
            return true;
        }
    }
    // Neither end of the edge connects to the player's network.
    return false;
}
// Calculates the maximum number of legal roads the player could place.
export function getMaxLegalRoadPlacements(
    game: GameState,
    playerId: string
): number {
    // Find the player being checked.
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    // A missing player cannot place roads.
    if (!player) {
        return 0;
    }
    // Calculate how many road pieces the player has left.
    const remainingRoads =
        15 - player.roads.length;
    // No pieces remaining means no possible placements.
    if (remainingRoads <= 0) {
        return 0;
    }
    // Use a temporary game state to simulate road placements.
    let simulatedGame = game;
    // Count how many legal placements were found.
    let roadsPlaced = 0;
    // Keep looking until the player runs out of roads
    // or no legal placement remains.
    while (roadsPlaced < remainingRoads) {
        // Find the next legal edge.
        const legalEdge = simulatedGame.board.edges.find(
            (edge) => {
                // Check whether the edge is already occupied.
                const occupied =
                    simulatedGame.players.some(
                        (candidate) =>
                            candidate.roads.includes(edge.id)
                    );
                // Skip occupied edges.
                if (occupied) {
                    return false;
                }
                // The edge must connect to the simulated network.
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
        // Add the simulated road without changing the real game.
        simulatedGame = {
            ...simulatedGame,
            players: simulatedGame.players.map(
                (candidate) =>
                    candidate.id === playerId
                        ? {
                            ...candidate,
                            // Add the simulated road to the player's network.
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
    // Return the maximum number of legal placements found.
    return roadsPlaced;
}