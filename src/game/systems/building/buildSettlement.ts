import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
import { getEffectiveSettlementCost } from "../../guilds/builder/passive/getEffectiveSettlementCost";
import { canPlaceSettlement } from "../validation/canPlaceSettlement";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
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
    if (game.robberPending) {
        return game;
    }
    if (game.lastDiceRoll === undefined) {
        return game;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    if (player.settlements.length >= 5) {
        return game;
    }
    const settlementCost =
        getEffectiveSettlementCost(player);
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
    const node = game.board.nodes.find(
        (candidate) => candidate.id === nodeId
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
                settlements: [
                    ...candidate.settlements,
                    {
                        id: `settlement-${
                            candidate.settlements.length + 1
                        }`,
                        playerId,
                        nodeId,
                    },
                ],
                guildPassiveUsedThisTurn:
                    candidate.guild === "builder" &&
                    !candidate.guildPassiveUsedThisTurn
                        ? true
                        : candidate.guildPassiveUsedThisTurn,
                vp: candidate.vp + 1,
            };
        });
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
        ore: game.resourceBank.ore,
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
        (candidate) => candidate.id === playerId
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