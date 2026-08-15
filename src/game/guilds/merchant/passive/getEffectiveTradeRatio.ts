import type { GameState } from "../../../engine/GameState";
import type { Resources } from "../../../engine/types";
import { getTradeRatio } from "../../../systems/trading/getTradeRatio";
export function getEffectiveTradeRatio(
    game: GameState,
    playerId: string,
    resource: keyof Resources
): number {
    const baseRatio = getTradeRatio(
        game,
        playerId,
        resource
    );
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return baseRatio;
    }
    if (
        player.guild === "merchant" &&
        !player.guildPassiveUsedThisTurn &&
        baseRatio === 4
    ) {
        return 3;
    }
    return baseRatio;
}