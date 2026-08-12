import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}
const resourceTypes: (keyof Resources)[] = [
  "brick",
  "lumber",
  "wheat",
  "sheep",
  "ore",
];
function discardRandomResources(
  resources: Resources,
  amount: number
): {
  resources: Resources;
  discarded: Resources;
} {
  const updatedResources: Resources = {
    ...resources,
  };
  const discarded: Resources = {
    brick: 0,
    lumber: 0,
    wheat: 0,
    sheep: 0,
    ore: 0,
  };
  for (let i = 0; i < amount; i++) {
    const availableResources: (keyof Resources)[] = [];
    // Add one entry for every actual card.
    // This makes the random selection card-weighted.
    for (const resource of resourceTypes) {
      for (let count = 0; count < updatedResources[resource]; count++) {
        availableResources.push(resource);
      }
    }
    if (availableResources.length === 0) {
      break;
    }
    const randomResource =
      availableResources[
      Math.floor(
        Math.random() * availableResources.length
      )
      ];
    updatedResources[randomResource] -= 1;
    discarded[randomResource] += 1;
  }
  return {
    resources: updatedResources,
    discarded,
  };
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
  if (total === 7) {
    const events = [
      createEvent(
        "DICE_ROLLED",
        `${currentPlayer.name} rolled ${dieOne} + ${dieTwo} = ${total}.`
      ),
    ];
    const updatedBank: Resources = {
      ...game.resourceBank,
    };
    const updatedPlayers = game.players.map((player) => {
      const totalCards =
        player.resources.brick +
        player.resources.lumber +
        player.resources.wheat +
        player.resources.sheep +
        player.resources.ore;
      if (totalCards <= 9) {
        return player;
      }
      const discardAmount =
        Math.floor(totalCards / 2);
      const {
        resources: updatedResources,
        discarded,
      } = discardRandomResources(
        player.resources,
        discardAmount
      );
      for (const resource of resourceTypes) {
        updatedBank[resource] += discarded[resource];
      }
      const discardedParts: string[] = [];
      for (const resource of resourceTypes) {
        if (discarded[resource] > 0) {
          discardedParts.push(
            `[${resource}] ${discarded[resource]}`
          );
        }
      }
      events.push(
        createEvent(
          "RESOURCES_DISCARDED",
          `${player.name} discarded ${discardedParts.join(", ")} because they had more than 9 cards.`
        )
      );
      return {
        ...player,
        resources: updatedResources,
      };
    });
    return {
      ...game,
      players: updatedPlayers,
      resourceBank: updatedBank,
      lastDiceRoll: total,
      robberPending: true,
      eventLog: [
        ...game.eventLog,
        ...events,
      ],
    };
  }
  const blockedTiles = new Set<string>();
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
    const ownedNodeIds = [
      ...player.settlements.map(
        (settlement) => settlement.nodeId
      ),
      ...player.cities,
    ];
    for (const nodeId of ownedNodeIds) {
      const node = game.board.nodes.find(
        (node) => node.id === nodeId
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
        if (tile.id === game.robberTileId) {
          // Log this tile as blocked.
          // Game Log output: "Do not produce resources".
          blockedTiles.add(tile.id);
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
  /*
   * Calculate the total requested amount of each
   * resource across ALL players before distributing.
   */
  const totalRequested: Resources = {
    brick: 0,
    lumber: 0,
    wheat: 0,
    sheep: 0,
    ore: 0,
  };
  for (const requested of requestedResourcesByPlayer.values()) {
    for (const resource of resourceTypes) {
      totalRequested[resource] +=
        requested[resource];
    }
  }
  /*
   * A resource is distributed only if the bank can
   * satisfy the ENTIRE request for that resource.
   */
  const canDistribute: Record<
    keyof Resources,
    boolean
  > = {
    brick:
      totalRequested.brick <=
      game.resourceBank.brick,
    lumber:
      totalRequested.lumber <=
      game.resourceBank.lumber,
    wheat:
      totalRequested.wheat <=
      game.resourceBank.wheat,
    sheep:
      totalRequested.sheep <=
      game.resourceBank.sheep,
    ore:
      totalRequested.ore <=
      game.resourceBank.ore,
  };
  const updatedBank: Resources = {
    ...game.resourceBank,
  };
  /*
   * Remove the full requested amount from the bank
   * only when the entire request can be fulfilled.
   */
  for (const resource of resourceTypes) {
    if (canDistribute[resource]) {
      updatedBank[resource] -=
        totalRequested[resource];
    }
  }
  const updatedPlayers =
    game.players.map((player) => {
      const requested =
        requestedResourcesByPlayer.get(
          player.id
        );
      if (!requested) {
        return player;
      }
      /*
       * If the bank cannot fulfill the total request,
       * every player receives zero of that resource.
       */
      const granted: Resources = {
        brick:
          canDistribute.brick
            ? requested.brick
            : 0,
        lumber:
          canDistribute.lumber
            ? requested.lumber
            : 0,
        wheat:
          canDistribute.wheat
            ? requested.wheat
            : 0,
        sheep:
          canDistribute.sheep
            ? requested.sheep
            : 0,
        ore:
          canDistribute.ore
            ? requested.ore
            : 0,
      };
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
  /*
   * Log resources that could not be distributed.
   */
  for (const tileId of blockedTiles) {
    const tile = game.board.tiles.find(
      (candidate) => candidate.id === tileId
    );
    if (!tile) {
      continue;
    }
    events.push(
      createEvent(
        "RESOURCES_COLLECTED",
        `(${tile.numberToken}) [${tile.resource}] is blocked by the Robber. No resources produced.`
      )
    );
  }
  for (const resource of resourceTypes) {
    if (
      totalRequested[resource] > 0 &&
      !canDistribute[resource]
    ) {
      events.push(
        createEvent(
          "RESOURCES_COLLECTED",
          `No ${resource} was given. ${totalRequested[resource]} needed but the bank had ${game.resourceBank[resource]}.`
        )
      );
    }
  }
  /*
   * Log resources actually received by each player.
   */
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
        `[brick] ${gained.brick}`
      );
    }
    if (gained.lumber > 0) {
      parts.push(
        `[lumber] ${gained.lumber}`
      );
    }
    if (gained.wheat > 0) {
      parts.push(
        `[wheat] ${gained.wheat}`
      );
    }
    if (gained.sheep > 0) {
      parts.push(
        `[sheep] ${gained.sheep}`
      );
    }
    if (gained.ore > 0) {
      parts.push(
        `[ore] ${gained.ore}`
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