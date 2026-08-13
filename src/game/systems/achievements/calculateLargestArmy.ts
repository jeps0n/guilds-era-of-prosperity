import type { GameState } from "../../engine/GameState";
export function calculateLargestArmy(
    game: GameState,
    playerId: string
): number {
    const player = game.players.find(
        (candidate) => candidate.id === playerId
    );
    if (!player) {
        return 0;
    }
    return player.knightsPlayed;
}