import type { GameState } from "../../../engine/GameState";
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
export function resolveMasterBuilder(
    game: GameState,
    playerId: string,
    selection: MasterBuilderSelection
): GameState {
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (!player || player.guild !== "builder") {
        return game;
    }
    const available =
        getMasterBuilder(game);
    if (
        selection === "city" &&
        !available.canBuildCity
    ) {
        return game;
    }
    if (
        selection === "settlement" &&
        !available.canBuildSettlement
    ) {
        return game;
    }
    /*
     * The Builder Super has now established a valid
     * building choice.
     *
     * Actual board/node interaction happens later.
     */
    return {
        ...game,
        masterBuilderPending: true,
        masterBuilderSelection: selection,
    };
}