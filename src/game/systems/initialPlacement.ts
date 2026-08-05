import type { GameState } from "../engine/GameState";

export function placeSettlement(
  game: GameState,
  playerId: string
): GameState {
  const updatedPlayers = game.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          settlements: [
            ...player.settlements,
            "settlement",
          ],
        }
      : player
  );

  return advancePlacement({
    ...game,
    players: updatedPlayers,
  });
}

function advancePlacement(game: GameState): GameState {
  return {
    ...game,
    placementStep: game.placementStep + 1,
  };
}