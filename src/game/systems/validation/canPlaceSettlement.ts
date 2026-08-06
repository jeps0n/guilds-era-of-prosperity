import type { GameState } from "../../engine/GameState";


export function canPlaceSettlement(
  game: GameState,
  nodeId: string
): boolean {

  /*
    Rule 1:
    Node cannot already contain a settlement
  */

  const occupied =
    game.players.some(
      (player) =>
        player.settlements.some(
          (settlement) =>
            settlement.nodeId === nodeId
        )
    );


  if (occupied) {
    return false;
  }



  /*
    Rule 2:
    Catan distance rule

    A settlement cannot be placed
    directly adjacent to another settlement.

    Existing Settlement
          |
        edge
          |
     Candidate Node

  */


  const adjacentNodes =
    getAdjacentNodes(
      game,
      nodeId
    );


  const blocked =
    game.players.some(
      (player) =>
        player.settlements.some(
          (settlement) =>
            adjacentNodes.includes(
              settlement.nodeId
            )
        )
    );


  if (blocked) {
    return false;
  }


  return true;
}





function getAdjacentNodes(
  game: GameState,
  nodeId: string
): string[] {

  return game.board.edges.flatMap(
    (edge) => {

      if (edge.nodeA === nodeId) {
        return [edge.nodeB];
      }


      if (edge.nodeB === nodeId) {
        return [edge.nodeA];
      }


      return [];

    }
  );

}