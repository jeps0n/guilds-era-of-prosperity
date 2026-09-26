import type { GameState } from "../../game/engine/GameState";
import type { Resources } from "../../game/engine/types";
import { canOpenGuildDiscountMenu } from "../../game/systems/actions/canOpenGuildDiscountMenu";
import { buildCity } from "../../game/systems/building/buildCity";
import { buildRoad } from "../../game/systems/building/buildRoad";
import { buildSettlement } from "../../game/systems/building/buildSettlement";
export type BuildingWorkflowResult =
    | { kind: "unchanged" }
    | { kind: "game"; game: GameState }
    | { kind: "chooseExplorerRoadDiscount"; edgeId: string }
    | { kind: "chooseBuilderSettlementDiscount"; nodeId: string }
    | { kind: "chooseBuilderCityDiscount"; nodeId: string };
export function requestRoadBuild(game: GameState, edgeId: string): BuildingWorkflowResult {
    const player = game.players.find((candidate) => candidate.id === game.currentPlayerId);
    if (!player) return { kind: "unchanged" };
    if (game.grandExpeditionPending || game.roadBuildingPending) {
        return changed(game, buildRoad(game, game.currentPlayerId, edgeId));
    }
    if (!canOpenGuildDiscountMenu(game, "road", edgeId)) return { kind: "unchanged" };
    if (player.guild === "explorer" && !player.guildPassiveUsedThisTurn &&
        player.resources.brick >= 1 && player.resources.lumber >= 1) {
        return { kind: "chooseExplorerRoadDiscount", edgeId };
    }
    return changed(game, buildRoad(game, game.currentPlayerId, edgeId));
}
export function confirmExplorerRoadBuild(game: GameState, edgeId: string, keep: "brick" | "lumber"): BuildingWorkflowResult {
    return changed(game, buildRoad(game, game.currentPlayerId, edgeId, keep));
}
export function requestSettlementBuild(game: GameState, nodeId: string): BuildingWorkflowResult {
    if (game.masterBuilderPending && game.masterBuilderSelection === "settlement") {
        return changed(game, buildSettlement(game, game.currentPlayerId, nodeId));
    }
    if (!canOpenGuildDiscountMenu(game, "settlement", nodeId)) return { kind: "unchanged" };
    const player = game.players.find((candidate) => candidate.id === game.currentPlayerId);
    if (!player) return { kind: "unchanged" };
    if (player.guild === "builder" && !player.guildPassiveUsedThisTurn) {
        const resources = ["brick", "lumber", "wheat", "sheep"] as const;
        const missing = resources.filter((resource) => player.resources[resource] < 1);
        if (missing.length === 1) {
            return changed(game, buildSettlement(game, game.currentPlayerId, nodeId, missing[0]));
        }
        if (missing.length === 0) return { kind: "chooseBuilderSettlementDiscount", nodeId };
        return { kind: "unchanged" };
    }
    return changed(game, buildSettlement(game, game.currentPlayerId, nodeId));
}
export function confirmBuilderSettlementBuild(game: GameState, nodeId: string, discount: keyof Resources): BuildingWorkflowResult {
    return changed(game, buildSettlement(game, game.currentPlayerId, nodeId, discount));
}
export function requestCityBuild(game: GameState, nodeId: string): BuildingWorkflowResult {
    const player = game.players.find((candidate) => candidate.id === game.currentPlayerId);
    if (!player) return { kind: "unchanged" };
    if (game.masterBuilderPending && game.masterBuilderSelection === "city") {
        return changed(game, buildCity(game, game.currentPlayerId, nodeId));
    }
    if (!canOpenGuildDiscountMenu(game, "city", nodeId)) return { kind: "unchanged" };
    if (player.guild === "builder" && !player.guildPassiveUsedThisTurn) {
        const oreOnly = player.resources.ore >= 2 && player.resources.ore < 3 && player.resources.wheat >= 2;
        const wheatOnly = player.resources.ore >= 3 && player.resources.wheat >= 1 && player.resources.wheat < 2;
        const fullCost = player.resources.ore >= 3 && player.resources.wheat >= 2;
        if (oreOnly) return changed(game, buildCity(game, game.currentPlayerId, nodeId, "ore"));
        if (wheatOnly) return changed(game, buildCity(game, game.currentPlayerId, nodeId, "wheat"));
        if (fullCost) return { kind: "chooseBuilderCityDiscount", nodeId };
    }
    return changed(game, buildCity(game, game.currentPlayerId, nodeId));
}
export function confirmBuilderCityBuild(game: GameState, nodeId: string, discount: "ore" | "wheat"): BuildingWorkflowResult {
    return changed(game, buildCity(game, game.currentPlayerId, nodeId, discount));
}
function changed(previous: GameState, next: GameState): BuildingWorkflowResult {
    return next === previous ? { kind: "unchanged" } : { kind: "game", game: next };
}
