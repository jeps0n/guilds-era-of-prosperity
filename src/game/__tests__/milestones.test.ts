import { describe, expect, it } from "vitest";
import { evaluateMilestones } from "../systems/milestones/evaluateMilestones";
import { createTestGame, withPlayer } from "./testState";
describe("game milestones", () => {
  it("starts Prosperity when a player reaches 6 VP", () => {
    const game = createTestGame();
    game.players[0] = withPlayer(game.players[0], { vp: 6 });
    const next = evaluateMilestones(game);
    expect(next.era).toBe("prosperity");
    expect(next.phase).toBe("playing");
  });
  it("ends the game immediately when a player reaches 15 VP", () => {
    const game = createTestGame({ era: "prosperity" });
    game.players[0] = withPlayer(game.players[0], { vp: 15 });
    const next = evaluateMilestones(game);
    expect(next.phase).toBe("game_over");
    expect(next.winnerId).toBe(game.players[0].id);
  });
});
