import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";

export function collectResources(
  game: GameState,
  playerId: string,
  settlementNodeId: string
): GameState {

  const node = game.board.nodes.find(
    (node) => node.id === settlementNodeId
  );

  if (!node) {
    return game;
  }

  const requestedResources: Resources = {
    brick: 0,
    lumber: 0,
    wheat: 0,
    sheep: 0,
    ore: 0,
  };

  node.adjacentTiles.forEach((tileId) => {

    const tile = game.board.tiles.find(
      (tile) => tile.id === tileId
    );

    if (!tile || tile.resource === "desert") {
      return;
    }

    requestedResources[tile.resource] += 1;

  });

  const resourcesGranted: Resources = {
    brick:
      game.resourceBank.brick >= requestedResources.brick
        ? requestedResources.brick
        : 0,

    lumber:
      game.resourceBank.lumber >= requestedResources.lumber
        ? requestedResources.lumber
        : 0,

    wheat:
      game.resourceBank.wheat >= requestedResources.wheat
        ? requestedResources.wheat
        : 0,

    sheep:
      game.resourceBank.sheep >= requestedResources.sheep
        ? requestedResources.sheep
        : 0,

    ore:
      game.resourceBank.ore >= requestedResources.ore
        ? requestedResources.ore
        : 0,
  };

  const updatedPlayers =
    game.players.map((player) => {

      if (player.id !== playerId) {
        return player;
      }

      return {
        ...player,

        resources: {
          brick:
            player.resources.brick +
            resourcesGranted.brick,

          lumber:
            player.resources.lumber +
            resourcesGranted.lumber,

          wheat:
            player.resources.wheat +
            resourcesGranted.wheat,

          sheep:
            player.resources.sheep +
            resourcesGranted.sheep,

          ore:
            player.resources.ore +
            resourcesGranted.ore,
        },
      };

    });

  const updatedBank = {

    brick:
      game.resourceBank.brick -
      resourcesGranted.brick,

    lumber:
      game.resourceBank.lumber -
      resourcesGranted.lumber,

    wheat:
      game.resourceBank.wheat -
      resourcesGranted.wheat,

    sheep:
      game.resourceBank.sheep -
      resourcesGranted.sheep,

    ore:
      game.resourceBank.ore -
      resourcesGranted.ore,
  };

  return {
    ...game,

    players: updatedPlayers,

    resourceBank: updatedBank,
  };

}