import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
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
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    if (
        player.resources.brick <
            ROAD_COST.brick ||
        player.resources.lumber <
            ROAD_COST.lumber
    ) {
        return game;
    }
    const edge = game.board.edges.find(
        (candidate) =>
            candidate.id === edgeId
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
                resources: {
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
    const updatedResourceBank = {
        ...game.resourceBank,
        brick:
            game.resourceBank.brick +
            ROAD_COST.brick,
        lumber:
            game.resourceBank.lumber +
            ROAD_COST.lumber,
    };
    return {
        ...game,
        players: updatedPlayers,
        resourceBank: updatedResourceBank,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "ROAD_PLACED",
                `${player.name} built a road.`
            ),
        ],
    };
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
            (edge) =>
                edge.id === edgeId
        );
    if (!candidateEdge) {
        return false;
    }
    const playerStructureNodes =
        new Set([
            ...player.settlements.map(
                (settlement) =>
                    settlement.nodeId
            ),
            ...player.cities,
        ]);
    const opponentStructureNodes =
        new Set(
            game.players
                .filter(
                    (candidate) =>
                        candidate.id !==
                        playerId
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
            playerStructureNodes.has(
                nodeId
            )
        ) {
            return true;
        }
        if (
            opponentStructureNodes.has(
                nodeId
            )
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