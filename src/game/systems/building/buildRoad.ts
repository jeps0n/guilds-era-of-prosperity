import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
import { getEffectiveRoadCost } from "../../guilds/explorer/passive/getEffectiveRoadCost";
type Resource = keyof Resources;
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
    if (game.phase !== "playing") {
        return game;
    }
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    if (game.lastDiceRoll === undefined) {
        return game;
    }
    if (game.robberPending) {
        return game;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    if (player.roads.length >= 15) {
        return game;
    }
    const isRoadBuilding =
        game.roadBuildingPending;
    /*
     * Road Building development card:
     * roads are completely free and do not consume
     * the Explorer passive.
     */
    let paymentResources: Resource[] = [];
    if (!isRoadBuilding) {
        /*
         * Explorer passive mirrors the Merchant discount flow:
         * determine the effective payment resources first.
         */
        if (
            player.guild === "explorer" &&
            !player.guildPassiveUsedThisTurn
        ) {
            const effectiveRoadCost =
                getEffectiveRoadCost(
                    player,
                    keepResource
                );
            /*
             * undefined means:
             * - Explorer has no brick/lumber, OR
             * - Explorer has both and has not made
             *   the required keep-resource choice.
             */
            if (!effectiveRoadCost) {
                return game;
            }
            paymentResources =
                effectiveRoadCost;
        } else {
            /*
             * Non-Explorer players and Explorers who
             * have already consumed their passive
             * pay the normal road cost.
             */
            paymentResources = ROAD_COST;
        }
        /*
         * Final affordability check.
         */
        for (const resource of paymentResources) {
            if (player.resources[resource] < 1) {
                return game;
            }
        }
    }
    const edge = game.board.edges.find(
        (candidate) => candidate.id === edgeId
    );
    if (!edge) {
        return game;
    }
    const edgeAlreadyOccupied =
        game.players.some(
            (candidate) =>
                candidate.roads.includes(edgeId)
        );
    if (edgeAlreadyOccupied) {
        return game;
    }
    if (
        !connectsToPlayerNetwork(
            game,
            playerId,
            edgeId
        )
    ) {
        return game;
    }
    /*
     * Explorer passive is consumed only when an
     * actual discounted road is successfully built.
     *
     * Road Building never consumes it.
     */
    const usesExplorerPassive =
        !isRoadBuilding &&
        player.guild === "explorer" &&
        !player.guildPassiveUsedThisTurn;
    const updatedPlayers =
        game.players.map((candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            const updatedResources = {
                ...candidate.resources,
            };
            for (const resource of paymentResources) {
                updatedResources[resource] -= 1;
            }
            return {
                ...candidate,
                resources: updatedResources,
                roads: [
                    ...candidate.roads,
                    edgeId,
                ],
                guildPassiveUsedThisTurn:
                    usesExplorerPassive
                        ? true
                        : candidate.guildPassiveUsedThisTurn,
            };
        });
    const updatedResourceBank = {
        ...game.resourceBank,
    };
    for (const resource of paymentResources) {
        updatedResourceBank[resource] += 1;
    }
    const roadPlacedEvent = createEvent(
        "ROAD_PLACED",
        isRoadBuilding
            ? `${player.name} placed a road using Road Building.`
            : `${player.name} built a road.`
    );
    const updatedGame: GameState = {
        ...game,
        players: updatedPlayers,
        resourceBank: updatedResourceBank,
        roadBuildingRoadsPlaced:
            isRoadBuilding
                ? game.roadBuildingRoadsPlaced + 1
                : game.roadBuildingRoadsPlaced,
        eventLog: [
            ...game.eventLog,
            roadPlacedEvent,
        ],
    };
    const longestRoadUpdatedGame =
        updateLongestRoad(updatedGame);
    if (!isRoadBuilding) {
        return evaluateMilestones(
            longestRoadUpdatedGame
        );
    }
    const updatedPlayer =
        longestRoadUpdatedGame.players.find(
            (candidate) =>
                candidate.id === playerId
        );
    if (!updatedPlayer) {
        return game;
    }
    if (updatedPlayer.roads.length >= 15) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    if (
        longestRoadUpdatedGame.roadBuildingRoadsPlaced >= 2
    ) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    const hasSecondLegalRoad =
        hasLegalRoadPlacement(
            longestRoadUpdatedGame,
            playerId
        );
    return evaluateMilestones({
        ...longestRoadUpdatedGame,
        roadBuildingPending: hasSecondLegalRoad,
    });
}
export function hasLegalRoadPlacement(
    game: GameState,
    playerId: string
): boolean {
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (!player) {
        return false;
    }
    if (player.roads.length >= 15) {
        return false;
    }
    return game.board.edges.some((edge) => {
        const occupied =
            game.players.some(
                (candidate) =>
                    candidate.roads.includes(edge.id)
            );
        if (occupied) {
            return false;
        }
        return connectsToPlayerNetwork(
            game,
            playerId,
            edge.id
        );
    });
}
function connectsToPlayerNetwork(
    game: GameState,
    playerId: string,
    edgeId: string
): boolean {
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (!player) {
        return false;
    }
    const candidateEdge =
        game.board.edges.find(
            (edge) => edge.id === edgeId
        );
    if (!candidateEdge) {
        return false;
    }
    const playerStructureNodes = new Set([
        ...player.settlements.map(
            (settlement) =>
                settlement.nodeId
        ),
        ...player.cities,
    ]);
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
    const candidateNodes = [
        candidateEdge.nodeA,
        candidateEdge.nodeB,
    ];
    for (const nodeId of candidateNodes) {
        if (
            playerStructureNodes.has(nodeId)
        ) {
            return true;
        }
        if (
            opponentStructureNodes.has(nodeId)
        ) {
            continue;
        }
        const connectedToPlayerRoad =
            game.board.edges.some((edge) => {
                if (
                    edge.id ===
                    candidateEdge.id
                ) {
                    return false;
                }
                if (
                    !player.roads.includes(
                        edge.id
                    )
                ) {
                    return false;
                }
                return (
                    edge.nodeA === nodeId ||
                    edge.nodeB === nodeId
                );
            });
        if (connectedToPlayerRoad) {
            return true;
        }
    }
    return false;
}
export function getMaxLegalRoadPlacements(
    game: GameState,
    playerId: string
): number {
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return 0;
    }
    const remainingRoads =
        15 - player.roads.length;
    if (remainingRoads <= 0) {
        return 0;
    }
    let simulatedGame = game;
    let roadsPlaced = 0;
    while (roadsPlaced < remainingRoads) {
        const legalEdge = simulatedGame.board.edges.find(
            (edge) => {
                const occupied =
                    simulatedGame.players.some(
                        (candidate) =>
                            candidate.roads.includes(edge.id)
                    );
                if (occupied) {
                    return false;
                }
                return connectsToPlayerNetwork(
                    simulatedGame,
                    playerId,
                    edge.id
                );
            }
        );
        if (!legalEdge) {
            break;
        }
        simulatedGame = {
            ...simulatedGame,
            players: simulatedGame.players.map(
                (candidate) =>
                    candidate.id === playerId
                        ? {
                            ...candidate,
                            roads: [
                                ...candidate.roads,
                                legalEdge.id,
                            ],
                        }
                        : candidate
            ),
        };
        roadsPlaced += 1;
    }
    return roadsPlaced;
}