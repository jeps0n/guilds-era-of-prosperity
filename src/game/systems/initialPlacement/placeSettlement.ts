import type { GameState } from "../../engine/GameState";
import { canPlaceSettlement } from "../validation/canPlaceSettlement";
import { collectResources } from "../resources/collectResources";
export function placeSettlement(
  game: GameState,
  playerId: string,
  nodeId: string
): GameState {
  if (!canPlaceSettlement(game, nodeId)) {
    return game;
  }
  const player =
    game.players.find(
      (player) => player.id === playerId
    );
  if (!player) {
    return game;
  }
  if (player.settlements.length >= 5) {
    return game;
  }
  const isSecondSettlement =
    player.settlements.length === 1;
  let updatedGame: GameState = {
    ...game,
    players:
      game.players.map(
        (player) =>
          player.id === playerId
            ? {
                ...player,
                vp:
                  player.vp + 1,
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
      ),
    lastPlacedSettlementNodeId:
      nodeId,
    placementAction:
      "road",
  };
  if (isSecondSettlement) {
    updatedGame =
      collectResources(
        updatedGame,
        playerId,
        nodeId
      );
  }
  return updatedGame;
}