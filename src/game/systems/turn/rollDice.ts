import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(
  game: GameState
): GameState {
  if (game.phase !== "playing") {
    return game;
  }

  if (game.lastDiceRoll !== undefined) {
    return game;
  }

  const currentPlayer =
    game.players.find(
      (player) =>
        player.id === game.currentPlayerId
    );

  if (!currentPlayer) {
    return game;
  }

  const dieOne = rollDie();
  const dieTwo = rollDie();
  const total = dieOne + dieTwo;

  const requestedResourcesByPlayer =
    new Map<string, Resources>();

  for (const player of game.players) {
    const requestedResources: Resources = {
      brick: 0,
      lumber: 0,
      wheat: 0,
      sheep: 0,
      ore: 0,
    };

    for (const settlement of player.settlements) {
      const node = game.board.nodes.find(
        (node) =>
          node.id === settlement.nodeId
      );

      if (!node) {
        continue;
      }

      for (const tileId of node.adjacentTiles) {
        const tile = game.board.tiles.find(
          (tile) => tile.id === tileId
        );

        if (
          !tile ||
          tile.resource === "desert" ||
          tile.numberToken !== total
        ) {
          continue;
        }

        requestedResources[tile.resource] +=
          player.cities.includes(node.id)
            ? 2
            : 1;
      }
    }

    requestedResourcesByPlayer.set(
      player.id,
      requestedResources
    );
  }

  const updatedBank: Resources = {
    ...game.resourceBank,
  };

  const updatedPlayers =
    game.players.map((player) => {
      const requested =
        requestedResourcesByPlayer.get(
          player.id
        );

      if (!requested) {
        return player;
      }

      const granted: Resources = {
        brick: Math.min(
          requested.brick,
          updatedBank.brick
        ),
        lumber: Math.min(
          requested.lumber,
          updatedBank.lumber
        ),
        wheat: Math.min(
          requested.wheat,
          updatedBank.wheat
        ),
        sheep: Math.min(
          requested.sheep,
          updatedBank.sheep
        ),
        ore: Math.min(
          requested.ore,
          updatedBank.ore
        ),
      };

      updatedBank.brick -=
        granted.brick;
      updatedBank.lumber -=
        granted.lumber;
      updatedBank.wheat -=
        granted.wheat;
      updatedBank.sheep -=
        granted.sheep;
      updatedBank.ore -=
        granted.ore;

      return {
        ...player,
        resources: {
          brick:
            player.resources.brick +
            granted.brick,
          lumber:
            player.resources.lumber +
            granted.lumber,
          wheat:
            player.resources.wheat +
            granted.wheat,
          sheep:
            player.resources.sheep +
            granted.sheep,
          ore:
            player.resources.ore +
            granted.ore,
        },
      };
    });

  const events = [
    createEvent(
      "DICE_ROLLED",
      `${currentPlayer.name} rolled ${dieOne} + ${dieTwo} = ${total}.`
    ),
  ];

  for (const player of updatedPlayers) {
    const before =
      game.players.find(
        (originalPlayer) =>
          originalPlayer.id === player.id
      );

    if (!before) {
      continue;
    }

    const gained: Resources = {
      brick:
        player.resources.brick -
        before.resources.brick,
      lumber:
        player.resources.lumber -
        before.resources.lumber,
      wheat:
        player.resources.wheat -
        before.resources.wheat,
      sheep:
        player.resources.sheep -
        before.resources.sheep,
      ore:
        player.resources.ore -
        before.resources.ore,
    };

    const totalGained =
      gained.brick +
      gained.lumber +
      gained.wheat +
      gained.sheep +
      gained.ore;

    if (totalGained === 0) {
      continue;
    }

    const parts: string[] = [];

    if (gained.brick > 0) {
      parts.push(
        `🧱 ${gained.brick}`
      );
    }

    if (gained.lumber > 0) {
      parts.push(
        `🌲 ${gained.lumber}`
      );
    }

    if (gained.wheat > 0) {
      parts.push(
        `🌾 ${gained.wheat}`
      );
    }

    if (gained.sheep > 0) {
      parts.push(
        `🐑 ${gained.sheep}`
      );
    }

    if (gained.ore > 0) {
      parts.push(
        `⛰️ ${gained.ore}`
      );
    }

    events.push(
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
    lastDiceRoll: total,
    eventLog: [
      ...game.eventLog,
      ...events,
    ],
  };
}