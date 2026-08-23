import type { GameState } from "../../../engine/GameState";
import { getMaxLegalRoadPlacements } from "../../../systems/building/buildRoad";
import { createEvent } from "../../../engine/createEvent";
const MAX_GRAND_EXPEDITION_ROADS = 3;
export interface GrandExpeditionModel {
    roadsToPlace: number;
}
export function getGrandExpedition(
    game: GameState
): GrandExpeditionModel {
    const playerId = game.currentPlayerId;
    const roadsToPlace = Math.min(
        MAX_GRAND_EXPEDITION_ROADS,
        getMaxLegalRoadPlacements(
            game,
            playerId
        )
    );
    return {
        roadsToPlace,
    };
}
export function resolveGrandExpedition(
    game: GameState,
    playerId: string
): GameState {
    const player = game.players.find(
        (candidate) =>
            candidate.id === playerId
    );
    if (!player) {
        return game;
    }
    if (player.guild !== "explorer") {
        return game;
    }
    const roadsToPlace = Math.min(
        MAX_GRAND_EXPEDITION_ROADS,
        getMaxLegalRoadPlacements(
            game,
            playerId
        )
    );
    /*
     * Grand Expedition does not select individual roads.
     *
     * The engine has already determined how many roads
     * the player may place. The actual road selection
     * happens after confirmation through normal board
     * interaction.
     *
     * Therefore this resolver only establishes the
     * pending road-placement state.
     */
    return {
        ...game,
        grandExpeditionPending:
            roadsToPlace > 0,
        grandExpeditionRoadsPlaced: 0,
        grandExpeditionRoadsToPlace:
            roadsToPlace,
        eventLog: [
            ...game.eventLog,
            createEvent(
                "SUPER_ACTIVATED",
                `${player.name} used guild super ability: GRAND EXPEDITION.`
            ),
        ],
    };
}