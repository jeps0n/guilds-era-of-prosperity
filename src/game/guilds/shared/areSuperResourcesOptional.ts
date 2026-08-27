import type { GameState } from "../../engine/GameState";
import { getMarketInsightCards } from "../merchant/super/marketInsightSuper";
import { getGrandExpedition } from "../explorer/super/grandExpeditionSuper";
import { getMasterBuilder } from "../builder/super/masterBuilderSuper";
export function areSuperResourcesOptional(
    game: GameState
): boolean {
    const player = game.players.find(
        (candidate) =>
            candidate.id === game.currentPlayerId
    );
    if (!player) {
        return false;
    }
    // Merchant:
    // Resources are optional when Market Insight
    // has development cards available.
    if (player.guild === "merchant") {
        return getMarketInsightCards(game).length > 0;
    }
    // Explorer:
    // Resources are optional when Grand Expedition
    // has at least one legal road to place.
    if (player.guild === "explorer") {
        return getGrandExpedition(game).roadsToPlace > 0;
    }
    // Builder:
    // Resources are optional when Master Builder
    // can build either a City or Settlement.
    if (player.guild === "builder") {
        const masterBuilder =
            getMasterBuilder(game);
        return (
            masterBuilder.canBuildCity ||
            masterBuilder.canBuildSettlement
        );
    }
    return false;
}