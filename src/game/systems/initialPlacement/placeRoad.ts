import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
export function placeRoad(
  game: GameState,
  playerId: string,
  edgeId: string
): GameState {
  const player =
    game.players.find(
      (player) =>
        player.id === playerId
    );
  if (!player) {
    return game;
  }
  if (player.roads.length >= 15) {
    return game;
  }
  const validEdge =
    game.board.edges.find(
      (edge) =>
        edge.id === edgeId &&
        (
          edge.nodeA ===
            game.lastPlacedSettlementNodeId ||
          edge.nodeB ===
            game.lastPlacedSettlementNodeId
        )
    );
  if (!validEdge) {
    return game;
  }
  const updatedPlayers =
    game.players.map(
      (player) =>
        player.id === playerId
          ? {
              ...player,
              roads: [
                ...player.roads,
                edgeId,
              ],
            }
          : player
    );
  return advancePlacement({
    ...game,
    players:
      updatedPlayers,
    placementAction:
      "settlement",
    lastPlacedSettlementNodeId:
      undefined,
    eventLog: [
      ...game.eventLog,
      createEvent(
        "INITIAL_ROAD_PLACED",
        `${player.name} placed a road.`
      ),
    ],
  });
}
function advancePlacement(
  game: GameState
): GameState {
  const nextStep =
    game.placementStep + 1;
  const complete =
    nextStep >=
    game.placementOrder.length;
  return {
    ...game,
    placementStep:
      complete
        ? game.placementStep
        : nextStep,
    currentPlayerId:
      complete
        ? game.placementOrder[
            game.placementOrder.length - 1
          ]
        : game.placementOrder[nextStep],
    phase:
      complete
        ? "playing"
        : game.phase,
  };
}