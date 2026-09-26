import { describe, expect, it } from "vitest";
import { endTurn } from "../systems/turn/endTurn";
import { createTestGame, withPlayer } from "./testState";
describe("turn completion", () => {
  it("does not end a turn before the primary dice roll", () => {
    const game = createTestGame({ lastDiceRoll: undefined });
    expect(endTurn(game)).toBe(game);
  });
  it("advances to the other player and clears turn-scoped flags", () => {
    const game = createTestGame();
    const current = game.players[0];
    game.players[0] = withPlayer(current, {
      guildPassiveUsedThisTurn: true,
      developmentCardPlayedThisTurn: true,
      developmentCardsPurchasedThisTurn: ["card-1"],
    });
    const next = endTurn(game);
    expect(next.currentPlayerId).toBe(game.players[1].id);
    expect(next.turnNumber).toBe(game.turnNumber + 1);
    expect(next.lastDiceRoll).toBeUndefined();
    const completed = next.players.find((player) => player.id === current.id)!;
    expect(completed.guildPassiveUsedThisTurn).toBe(false);
    expect(completed.developmentCardPlayedThisTurn).toBe(false);
    expect(completed.developmentCardsPurchasedThisTurn).toEqual([]);
  });
  it("requires Prosperity secondary resolution when Super is not unlocked", () => {
    const game = createTestGame({ era: "prosperity", secondaryRollPending: false, secondaryRoll: undefined });
    game.players[0] = withPlayer(game.players[0], { superUnlocked: false });
    const next = endTurn(game);
    expect(next.currentPlayerId).toBe(game.currentPlayerId);
    expect(next.secondaryRollPending).toBe(true);
  });
  it("bypasses the Prosperity secondary roll after the current player's Super unlocks", () => {
    const game = createTestGame({ era: "prosperity", secondaryRollPending: false, secondaryRoll: undefined });
    game.players[0] = withPlayer(game.players[0], { superUnlocked: true });
    const next = endTurn(game);
    expect(next.currentPlayerId).toBe(game.players[1].id);
    expect(next.secondaryRollPending).toBe(false);
  });
});
