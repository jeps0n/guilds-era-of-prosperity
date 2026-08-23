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
    // Game must be active.
    if (game.phase !== "playing") {
        return game;
    }
    // Only the current player can build.
    if (game.currentPlayerId !== playerId) {
        return game;
    }
    // Block other building during unrelated pending actions.
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
    // Master Builder settlement is allowed before the dice roll.
    const isMasterBuilderSettlement =
        game.masterBuilderPending &&
        game.masterBuilderSelection === "settlement";
    // Normal settlement building requires a dice roll.
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
    if (!player) {
        return game;
    }
    // Enforce the five-settlement limit.
    if (player.settlements.length >= 5) {
        return game;
    }
    // Check Builder passive availability.
    const isBuilder =
        player.guild === "builder";
    const builderPassiveAvailable =
        isBuilder &&
        !player.guildPassiveUsedThisTurn;
    // Master Builder settlement is free.
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
    // Builder discount validation only applies
    // to a normal settlement build.
    if (!isMasterBuilderSettlement) {
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
         */
        if (
            builderPassiveAvailable &&
            discountedResource === undefined
        ) {
            return game;
        }
        /*
         * Final affordability check against the effective
         * settlement cost.
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
     *
     * Master Builder does not consume the Builder passive.
     */
    const usesBuilderPassive =
        !isMasterBuilderSettlement &&
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
                        id: `settlement-${candidate.settlements.length + 1}`,
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
                isMasterBuilderSettlement
                    ? `${player.name} built a settlement using Master Builder.`
                    : `${player.name} built a settlement.`
            ),
        ],
    };
    const longestRoadUpdatedGame =
        updateLongestRoad(updatedGame);
    return evaluateMilestones({
        ...longestRoadUpdatedGame,
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