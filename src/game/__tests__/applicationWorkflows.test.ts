import { describe, expect, it } from "vitest";
import { prepareTurnEnd } from "../../application/turn/prepareTurnEnd";
import { createTestGame } from "./testState";
describe("application workflows", () => {
  it("manual turn preparation cancels unfinished development-card workflows", () => {
    const game = createTestGame({
      monopolyPending: true,
      monopolyCardId: "monopoly-card",
      monopolyResource: "ore",
      yearOfPlentyPending: true,
      yearOfPlentyCardId: "plenty-card",
      yearOfPlentyFirstResource: "brick",
      roadBuildingPending: true,
      roadBuildingCardId: "road-card",
      roadBuildingRoadsPlaced: 1,
    });
    const prepared = prepareTurnEnd(game);
    expect(prepared).toMatchObject({
      monopolyPending: false,
      monopolyCardId: undefined,
      monopolyResource: undefined,
      yearOfPlentyPending: false,
      yearOfPlentyCardId: undefined,
      yearOfPlentyFirstResource: undefined,
      roadBuildingPending: false,
      roadBuildingCardId: undefined,
      roadBuildingRoadsPlaced: 0,
    });
  });
});
