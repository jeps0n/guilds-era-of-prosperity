import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
import { getEffectiveRoadCost } from "../../guilds/explorer/passive/getEffectiveRoadCost";
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
    /*
     * Road Building development card:
     * roads are completely free and do not consume
     * the Explorer passive.
     */
    const roadCost =
        !isRoadBuilding &&
        player.guild === "explorer" &&
        !player.guildPassiveUsedThisTurn
            ? getEffectiveRoadCost(player)
            : ROAD_COST;
    /*
     * Normal road/passive road affordability.
     */
    if (!isRoadBuilding) {
        if (
            player.resources.brick < roadCost.brick ||
            player.resources.lumber < roadCost.lumber
        ) {
            return game;
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
    const usesExplorerPassive =
        !isRoadBuilding &&
        player.guild === "explorer" &&
        !player.guildPassiveUsedThisTurn;
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
                            roadCost.brick,
                        lumber:
                            candidate.resources.lumber -
                            roadCost.lumber,
                    },
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
    const updatedResourceBank =
        isRoadBuilding
            ? game.resourceBank
            : {
                ...game.resourceBank,
                brick:
                    game.resourceBank.brick +
                    roadCost.brick,
                lumber:
                    game.resourceBank.lumber +
                    roadCost.lumber,
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