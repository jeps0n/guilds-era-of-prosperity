import { describe, expect, it } from "vitest";
import { getEffectiveSettlementCost } from "../guilds/builder/passive/getEffectiveSettlementCost";
import { getEffectiveCityCost } from "../guilds/builder/passive/getEffectiveCityCost";
import { getEffectiveRoadCost } from "../guilds/explorer/passive/getEffectiveRoadCost";
import { getEffectiveDevelopmentCardCost } from "../guilds/merchant/passive/getEffectiveDevelopmentCardCost";
import { createTestGame, withPlayer } from "./testState";
describe("guild passive costs", () => {
  it("Builder removes one selected settlement resource on its unused passive", () => {
    const game = createTestGame();
    const player = withPlayer(game.players[0], { guild: "builder", guildPassiveUsedThisTurn: false });
    expect(getEffectiveSettlementCost(player, "brick")).toEqual({
      brick: 0, lumber: 1, wheat: 1, sheep: 1, ore: 0,
    });
  });
  it("Builder removes one unit of a selected city resource", () => {
    const game = createTestGame();
    const player = withPlayer(game.players[0], { guild: "builder", guildPassiveUsedThisTurn: false });
    expect(getEffectiveCityCost(player, "ore")).toMatchObject({ ore: 2, wheat: 2 });
    expect(getEffectiveCityCost(player, "wheat")).toMatchObject({ ore: 3, wheat: 1 });
  });
  it("used Builder passive falls back to normal costs", () => {
    const game = createTestGame();
    const player = withPlayer(game.players[0], { guild: "builder", guildPassiveUsedThisTurn: true });
    expect(getEffectiveSettlementCost(player, "brick").brick).toBe(1);
    expect(getEffectiveCityCost(player, "ore").ore).toBe(3);
  });
  it("Explorer road passive pays the only available normal road resource", () => {
    const game = createTestGame();
    const player = withPlayer(game.players[0], {
      guild: "explorer",
      resources: { brick: 1, lumber: 0, wheat: 0, sheep: 0, ore: 0 },
    });
    expect(getEffectiveRoadCost(player)).toEqual(["brick"]);
  });
  it("Explorer chooses which resource to keep when both road resources exist", () => {
    const game = createTestGame();
    const player = withPlayer(game.players[0], {
      guild: "explorer",
      resources: { brick: 1, lumber: 1, wheat: 0, sheep: 0, ore: 0 },
    });
    expect(getEffectiveRoadCost(player, "brick")).toEqual(["lumber"]);
    expect(getEffectiveRoadCost(player, "lumber")).toEqual(["brick"]);
  });
  it("Merchant development-card passive can pay with two of the three normal resources", () => {
    const game = createTestGame();
    const player = withPlayer(game.players[0], {
      guild: "merchant",
      resources: { brick: 0, lumber: 0, wheat: 1, sheep: 1, ore: 1 },
    });
    expect(getEffectiveDevelopmentCardCost(player, "ore")).toEqual(["wheat", "sheep"]);
  });
});
