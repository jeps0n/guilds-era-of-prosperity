import type { GameState } from "../../engine/GameState";
import { canPlaceSettlement } from "../validation/canPlaceSettlement";


export function placeSettlement(
  game: GameState,
  playerId: string,
  nodeId: string
): GameState {

  if (
    !canPlaceSettlement(
      game,
      nodeId
    )
  ) {
    return game;
  }


  const updatedPlayers =
    game.players.map(
      (player) =>
        player.id === playerId
          ? {
              ...player,

              settlements: [
                ...player.settlements,

                {
                  id:
                    `settlement-${player.settlements.length + 1}`,

                  playerId,

                  nodeId,
                },

              ],
            }
          : player
    );


  return {

    ...game,

    players:
      updatedPlayers,


    lastPlacedSettlementNodeId:
      nodeId,


    placementAction:
      "road",

  };

}