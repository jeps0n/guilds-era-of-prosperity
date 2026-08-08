import type { GameState } from "../../engine/GameState";
export function endTurn(
  game: GameState
): GameState {
  if (game.phase !== "playing") {
    return game;
  }
  if (game.lastDiceRoll === undefined) {
    return game;
  }
  const nextPlayer = game.players.find(
    (player) =>
      player.id !== game.currentPlayerId
  );
  if (!nextPlayer) {
    return game;
  }
  return {
    ...game,
    currentPlayerId: nextPlayer.id,
    turnNumber: game.turnNumber + 1,
    lastDiceRoll: undefined,
  };
}