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
  const updatedPlayers = game.players.map(
    (player) => {
      if (player.id !== game.currentPlayerId) {
        return player;
      }
      return {
        ...player,
        developmentCardsPurchasedThisTurn: [],
        developmentCardPlayedThisTurn: false,
      };
    }
  );
  return {
    ...game,
    players: updatedPlayers,
    currentPlayerId: nextPlayer.id,
    turnNumber: game.turnNumber + 1,
    lastDiceRoll: undefined,
    // Cancel any unfinished Year of Plenty selection
    // when the player ends their turn.
    yearOfPlentyPending: false,
    yearOfPlentyCardId: undefined,
    yearOfPlentyFirstResource: undefined,
  };
}