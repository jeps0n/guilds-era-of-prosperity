import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
const ROAD_COST = {
    brick: 1,
    lumber: 1,
};
export function buildRoad(
    game: GameState,
    playerId: string,
    edgeId: string
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
    // Normal road building requires resources.
    // Road Building development cards provide roads for free.
    if (
        !isRoadBuilding &&
        (
            player.resources.brick <
            ROAD_COST.brick ||
            player.resources.lumber <
            ROAD_COST.lumber
        )) {
        return game;
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
    const updatedPlayers =
        game.players.map((candidate) => {
            if (candidate.id !== playerId) {
                return candidate;
            }
            return {
                ...candidate,
                resources: isRoadBuilding
                    ? candidate.resources
                    : {
                        ...candidate.resources,
                        brick:
                            candidate.resources.brick -
                            ROAD_COST.brick,
                        lumber:
                            candidate.resources.lumber -
                            ROAD_COST.lumber,
                    },
                roads: [
                    ...candidate.roads,
                    edgeId,
                ],
            };
        });
    const updatedResourceBank =
        isRoadBuilding
            ? game.resourceBank
            : {
                ...game.resourceBank,
                brick:
                    game.resourceBank.brick +
                    ROAD_COST.brick,
                lumber:
                    game.resourceBank.lumber +
                    ROAD_COST.lumber,
            };
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
    /*
     * Recalculate Longest Road after every successful road placement.
     */
    const longestRoadUpdatedGame =
        updateLongestRoad(updatedGame);
    if (!isRoadBuilding) {
        return evaluateMilestones(
            longestRoadUpdatedGame
        );
    }
    /*
    * Road Building allows up to two roads.
    *
    * The number of roads placed during the current
    * Road Building resolution is tracked explicitly
    * in GameState.
    */
    const updatedPlayer =
        longestRoadUpdatedGame.players.find(
            (candidate) =>
                candidate.id === playerId
        );
    if (!updatedPlayer) {
        return game;
    }
    // No physical road pieces remain.
    if (updatedPlayer.roads.length >= 15) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    // Two roads have been placed.
    if (longestRoadUpdatedGame.roadBuildingRoadsPlaced >= 2) {
        return evaluateMilestones({
            ...longestRoadUpdatedGame,
            roadBuildingPending: false,
            roadBuildingRoadsPlaced: 0,
        });
    }
    /*
     * We have placed exactly one road.
     *
     * If there is no legal second road, the Road Building
     * effect is complete. The player does not get another
     * road because there is nowhere legal to place it.
     */
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
function hasLegalRoadPlacement(
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
                    candidate.roads.includes(
                        edge.id
                    )
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