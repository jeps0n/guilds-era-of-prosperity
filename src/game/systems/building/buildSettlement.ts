import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { getEffectiveSettlementCost } from "../../guilds/builder/passive/getEffectiveSettlementCost";
import { canPlaceSettlement } from "../validation/canPlaceSettlement";
import { updateLongestRoad } from "../achievements/updateLongestRoad";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
type Resource = keyof Resources;
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
    const isBuilder =
        player.guild === "builder";
    const builderPassiveAvailable =
        isBuilder &&
        !player.guildPassiveUsedThisTurn;
    /*
     * If Builder is attempting to use the passive,
     * the discounted resource must be one of the
     * four resources normally required by a settlement.
     */
    if (
        builderPassiveAvailable &&
        discountedResource !== undefined &&
        !SETTLEMENT_RESOURCES.includes(
            discountedResource
        )
    ) {
        return game;
    }
    /*
     * A Builder with an unused passive must explicitly
     * provide the resource being discounted.
     *
     * Normal players, and Builders whose passive has
     * already been used, use the normal settlement cost.
     */
    if (
        builderPassiveAvailable &&
        discountedResource === undefined
    ) {
        return game;
    }
    const settlementCost =
        getEffectiveSettlementCost(
            player,
            discountedResource
        );
    /*
     * Final affordability check against the effective
     * cost. The engine remains authoritative regardless
     * of what the UI says is affordable.
     */
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
    /*
     * The passive is consumed only after all validation
     * succeeds and the settlement is actually built.
     */
    const usesBuilderPassive =
        builderPassiveAvailable &&
        discountedResource !== undefined;
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
                        id: `settlement-${candidate.settlements.length + 1
                            }`,
                        playerId,
                        nodeId,
                    },
                ],
                guildPassiveUsedThisTurn:
                    usesBuilderPassive
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
        ore:
            game.resourceBank.ore,
    };
    const updatedGame: GameState = {
        ...game,
        players: updatedPlayers,
        resourceBank:
            updatedResourceBank,
        lastPlacedSettlementNodeId:
            nodeId,
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
export function hasLegalSettlementPlacement(
    game: GameState,
    playerId: string
): boolean {
    if (game.phase !== "playing") {
        return false;
    }
    if (game.currentPlayerId !== playerId) {
        return false;
    }
    if (game.robberPending) {
        return false;
    }
    if (game.lastDiceRoll === undefined) {
        return false;
    }
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return false;
    }
    if (player.settlements.length >= 5) {
        return false;
    }
    return game.board.nodes.some((node) => {
        if (!canPlaceSettlement(game, node.id)) {
            return false;
        }
        return connectsToPlayerRoad(
            game,
            playerId,
            node.id
        );
    });
}