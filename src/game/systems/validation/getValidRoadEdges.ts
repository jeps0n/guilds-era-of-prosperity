import type { GameState } from "../../engine/GameState";

export function getValidRoadEdges(
  game: GameState
): string[] {

  if (!game.lastPlacedSettlementNodeId) {
    return [];
  }


  return game.board.edges

    .filter(
      (edge) =>
        (
          edge.nodeA === game.lastPlacedSettlementNodeId ||
          edge.nodeB === game.lastPlacedSettlementNodeId
        )
    )

    .filter(
      (edge) =>
        !game.players.some(
          (player) =>
            player.roads.includes(edge.id)
        )
    )

    .map(
      (edge) =>
        edge.id
    );

}