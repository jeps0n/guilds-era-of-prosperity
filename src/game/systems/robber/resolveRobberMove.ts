import { createEvent } from "../../engine/createEvent";
import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
const RESOURCE_TYPES: (keyof Resources)[] = ["brick", "lumber", "wheat", "sheep", "ore"];
export function resolveRobberMove(game: GameState, tileId: string): GameState {
    const tile = game.board.tiles.find((candidate) => candidate.id === tileId);
    const currentPlayer = game.players.find((player) => player.id === game.currentPlayerId);
    if (!tile || !currentPlayer) return game;
    const adjacentNodes = game.board.nodes.filter((node) => node.adjacentTiles.includes(tileId));
    const eligibleOpponents = game.players.filter((player) => {
        if (player.id === currentPlayer.id) return false;
        return adjacentNodes.some((node) =>
            player.settlements.some((settlement) => settlement.nodeId === node.id) ||
            player.cities.includes(node.id)
        );
    });
    const opponent = eligibleOpponents.length > 0
        ? eligibleOpponents[Math.floor(Math.random() * eligibleOpponents.length)]
        : undefined;
    const stealableResources = opponent
        ? RESOURCE_TYPES.filter((resource) => opponent.resources[resource] > 0)
        : [];
    const stolenResource = stealableResources.length > 0
        ? stealableResources[Math.floor(Math.random() * stealableResources.length)]
        : undefined;
    const players = game.players.map((player) => {
        if (stolenResource && opponent && player.id === opponent.id) {
            return { ...player, resources: { ...player.resources, [stolenResource]: player.resources[stolenResource] - 1 } };
        }
        if (stolenResource && player.id === currentPlayer.id) {
            return { ...player, resources: { ...player.resources, [stolenResource]: player.resources[stolenResource] + 1 } };
        }
        return player;
    });
    const events = [
        createEvent("ROBBER_MOVED", `${currentPlayer.name} moved the Robber to (${tile.numberToken ?? "?"}) [${tile.resource}]`),
        ...(stolenResource && opponent
            ? [createEvent("RESOURCE_STOLEN", `${currentPlayer.name} stole [${stolenResource}] 1 from ${opponent.name}.`)]
            : []),
    ];
    return { ...game, players, robberTileId: tileId, robberPending: false, eventLog: [...game.eventLog, ...events] };
}
