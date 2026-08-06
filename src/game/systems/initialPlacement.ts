import type { GameState } from "../engine/GameState";

export function placeSettlement(
  game: GameState,
  playerId: string,
  nodeId: string
): GameState {
  const updatedPlayers = game.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          settlements: [
            ...player.settlements,
            {
              id: `settlement-${player.settlements.length + 1}`,
              playerId,
              nodeId,
            },
          ],
        }
      : player
  );

  return advancePlacement({
    ...game,
    players: updatedPlayers,
  });
}

function advancePlacement(
  game: GameState
): GameState {
  const nextStep =
    game.placementStep + 1;

  const placementOrder = [
    game.players[0].id,
    game.players[1].id,
    game.players[1].id,
    game.players[0].id,
  ];

  const placementComplete =
    nextStep >= placementOrder.length;

  return {
    ...game,

    placementStep: nextStep,

    currentPlayerId: placementComplete
      ? game.currentPlayerId
      : placementOrder[nextStep],

    phase: placementComplete
      ? "playing"
      : game.phase,
  };
}