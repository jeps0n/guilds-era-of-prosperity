import type { GameState } from "../../game/engine/GameState";
/** Cancels optional development-card workflows before a manual turn end. */
export function prepareTurnEnd(game: GameState): GameState {
    return {
        ...game,
        monopolyPending: false,
        monopolyCardId: undefined,
        monopolyResource: undefined,
        yearOfPlentyPending: false,
        yearOfPlentyCardId: undefined,
        yearOfPlentyFirstResource: undefined,
        roadBuildingPending: false,
        roadBuildingCardId: undefined,
        roadBuildingRoadsPlaced: 0,
    };
}
