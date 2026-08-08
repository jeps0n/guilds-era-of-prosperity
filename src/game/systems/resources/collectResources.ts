import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
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
  const player = game.players.find(
    (player) => player.id === playerId
  );
  if (!player) {
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
    if (
      !tile ||
      tile.resource === "desert"
    ) {
      return;
    }
    requestedResources[tile.resource] += 1;
  });
  const resourcesGranted: Resources = {
    brick: Math.min(
      requestedResources.brick,
      game.resourceBank.brick
    ),
    lumber: Math.min(
      requestedResources.lumber,
      game.resourceBank.lumber
    ),
    wheat: Math.min(
      requestedResources.wheat,
      game.resourceBank.wheat
    ),
    sheep: Math.min(
      requestedResources.sheep,
      game.resourceBank.sheep
    ),
    ore: Math.min(
      requestedResources.ore,
      game.resourceBank.ore
    ),
  };
  const updatedPlayers = game.players.map(
    (player) => {
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
    }
  );
  const updatedBank: Resources = {
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
  const parts: string[] = [];
  if (resourcesGranted.brick > 0) {
    parts.push(
      `🧱 ${resourcesGranted.brick}`
    );
  }
  if (resourcesGranted.lumber > 0) {
    parts.push(
      `🌲 ${resourcesGranted.lumber}`
    );
  }
  if (resourcesGranted.wheat > 0) {
    parts.push(
      `🌾 ${resourcesGranted.wheat}`
    );
  }
  if (resourcesGranted.sheep > 0) {
    parts.push(
      `🐑 ${resourcesGranted.sheep}`
    );
  }
  if (resourcesGranted.ore > 0) {
    parts.push(
      `⛰️ ${resourcesGranted.ore}`
    );
  }
  const eventLog = [...game.eventLog];
  if (parts.length > 0) {
    eventLog.push(
      createEvent(
        "RESOURCES_COLLECTED",
        `${player.name} received ${parts.join(", ")}.`
      )
    );
  }
  return {
    ...game,
    players: updatedPlayers,
    resourceBank: updatedBank,
    eventLog,
  };
}