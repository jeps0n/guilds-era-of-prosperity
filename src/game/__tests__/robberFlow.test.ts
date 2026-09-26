import { describe, expect, it } from "vitest";
import { resolveRobberMove } from "../systems/robber/resolveRobberMove";
import { createTestGame, withPlayer } from "./testState";
describe("robber resolution", () => {
  it("ignores an unknown destination tile", () => {
    const game = createTestGame({ robberPending: true });
    expect(resolveRobberMove(game, "missing-tile")).toBe(game);
  });
  it("moves the robber and steals the opponent's only available resource", () => {
    const game = createTestGame({ robberPending: true });
    const tile = game.board.tiles.find((candidate) =>
      game.board.nodes.some((node) => node.adjacentTiles.includes(candidate.id)),
    )!;
    const adjacentNode = game.board.nodes.find((node) => node.adjacentTiles.includes(tile.id))!;
    const current = game.players[0];
    const opponent = game.players[1];
    game.players[0] = withPlayer(current, {
      resources: { brick: 0, lumber: 0, wheat: 0, sheep: 0, ore: 0 },
    });
    game.players[1] = withPlayer(opponent, {
      settlements: [{ id: "test-settlement", playerId: opponent.id, nodeId: adjacentNode.id }],
      resources: { brick: 0, lumber: 0, wheat: 0, sheep: 1, ore: 0 },
    });
    const next = resolveRobberMove(game, tile.id);
    const nextCurrent = next.players.find((player) => player.id === current.id)!;
    const nextOpponent = next.players.find((player) => player.id === opponent.id)!;
    expect(next.robberTileId).toBe(tile.id);
    expect(next.robberPending).toBe(false);
    expect(nextCurrent.resources.sheep).toBe(1);
    expect(nextOpponent.resources.sheep).toBe(0);
    expect(next.eventLog.at(-1)?.type).toBe("RESOURCE_STOLEN");
  });
});
