import type { GameState } from "../../../engine/GameState";
import { createEvent } from "../../../engine/createEvent";
import {
    hasLegalCityPlacement,
} from "../../../systems/building/buildCity";
import {
    hasLegalSettlementPlacement,
} from "../../../systems/building/buildSettlement";
export type MasterBuilderSelection =
    | "city"
    | "settlement";
export interface MasterBuilderModel {
    canBuildCity: boolean;
    canBuildSettlement: boolean;
}
/**
 * Calculates what the Builder can legally choose
 * when activating Master Builder.
 *
 * This is intentionally analogous to getGrandExpedition().
 */
export function getMasterBuilder(
    game: GameState
): MasterBuilderModel {
    const player = game.players.find(
        (candidate) =>
            candidate.id === game.currentPlayerId
    );
    if (!player || player.guild !== "builder") {
        return {
            canBuildCity: false,
            canBuildSettlement: false,
        };
    }
    return {
        canBuildCity:
            hasLegalCityPlacement(
                game,
                player.id
            ),
        canBuildSettlement:
            hasLegalSettlementPlacement(
                game,
                player.id
            ),
    };
}
/**
 * Resolves the selection portion of Master Builder.
 *
 * This does NOT build anything.
 *
 * It establishes the pending board interaction,
 * exactly as Grand Expedition establishes its
 * pending road-placement interaction.
 */
export function resolveMasterBuilder(
    game: GameState,
    playerId: string,
    selection: MasterBuilderSelection
): GameState {
    if (
        game.phase !== "playing"
    ) {
        return game;
    }
    if (
        game.currentPlayerId !== playerId
    ) {
        return game;
    }
    if (
        game.masterBuilderPending
    ) {
        return game;
    }
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (
        !player ||
        player.guild !== "builder"
    ) {
        return game;
    }
    const masterBuilder =
        getMasterBuilder(game);
    if (
        selection === "city" &&
        !masterBuilder.canBuildCity
    ) {
        return game;
    }
    if (
        selection === "settlement" &&
        !masterBuilder.canBuildSettlement
    ) {
        return game;
    }
    return {
        ...game,
        masterBuilderPending: true,
        masterBuilderSelection: selection,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "SUPER_ACTIVATED",
                `${player.name} used Guild Super Ability: MASTER BUILDER.`
            ),
        ],
    };
}