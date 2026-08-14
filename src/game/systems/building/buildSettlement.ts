import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { canPlaceSettlement } from "../validation/canPlaceSettlement";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
const SETTLEMENT_COST = {
    brick: 1,
    lumber: 1,
    wheat: 1,
    sheep: 1,
};
export function buildSettlement(
    game: GameState,
    playerId: string,
    nodeId: string
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
    if (player.settlements.length >= 5) {
        return game;
    }
    if (
        player.resources.brick <
        SETTLEMENT_COST.brick ||
        player.resources.lumber <
        SETTLEMENT_COST.lumber ||
        player.resources.wheat <
        SETTLEMENT_COST.wheat ||
        player.resources.sheep <
        SETTLEMENT_COST.sheep
    ) {
        return game;
    }
    const node = game.board.nodes.find(
        (candidate) =>
            candidate.id === nodeId
    );
    if (!node) {
        return game;
    }
    if (!canPlaceSettlement(game, nodeId)) {
        return game;
    }
    if (
        !connectsToPlayerRoad(
            game,
            playerId,
            nodeId
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
                        SETTLEMENT_COST.brick,
                    lumber:
                        candidate.resources.lumber -
                        SETTLEMENT_COST.lumber,
                    wheat:
                        candidate.resources.wheat -
                        SETTLEMENT_COST.wheat,
                    sheep:
                        candidate.resources.sheep -
                        SETTLEMENT_COST.sheep,
                },
                settlements: [
                    ...candidate.settlements,
                    {
                        id: `settlement-${candidate.settlements.length + 1
                            }`,
                        playerId,
                        nodeId,
                    },
                ],
                vp: candidate.vp + 1,
            };
        });
    const updatedResourceBank = {
        ...game.resourceBank,
        brick:
            game.resourceBank.brick +
            SETTLEMENT_COST.brick,
        lumber:
            game.resourceBank.lumber +
            SETTLEMENT_COST.lumber,
        wheat:
            game.resourceBank.wheat +
            SETTLEMENT_COST.wheat,
        sheep:
            game.resourceBank.sheep +
            SETTLEMENT_COST.sheep,
    };
    const updatedGame: GameState = {
        ...game,
        players: updatedPlayers,
        resourceBank: updatedResourceBank,
        lastPlacedSettlementNodeId: nodeId,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "SETTLEMENT_BUILT",
                `${player.name} built a settlement.`
            ),
        ],
    };
    const longestRoadUpdatedGame =
        updateLongestRoad(updatedGame);

    return evaluateMilestones(
        longestRoadUpdatedGame
    );
}
function connectsToPlayerRoad(
    game: GameState,
    playerId: string,
    nodeId: string
): boolean {
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (!player) {
        return false;
    }
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