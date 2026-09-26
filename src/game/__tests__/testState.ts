import { createInitialState } from "../engine/initialState";
import type { GameState } from "../engine/GameState";
import type { Player } from "../engine/types";
export function createTestGame(overrides: Partial<GameState> = {}): GameState {
  const game = createInitialState();
  return {
    ...game,
    phase: "playing",
    currentPlayerId: game.players[0].id,
    guildSelectionPlayerId: game.players[0].id,
    placementStep: game.placementOrder.length,
    lastDiceRoll: 8,
    eventLog: [],
    ...overrides,
  };
}
export function withPlayer(player: Player, overrides: Partial<Player>): Player {
  return {
    ...player,
    ...overrides,
    resources: overrides.resources ?? player.resources,
    tradeRatios: overrides.tradeRatios ?? player.tradeRatios,
    roads: overrides.roads ?? player.roads,
    settlements: overrides.settlements ?? player.settlements,
    cities: overrides.cities ?? player.cities,
    developmentCards: overrides.developmentCards ?? player.developmentCards,
    developmentCardsPurchasedThisTurn:
      overrides.developmentCardsPurchasedThisTurn ?? player.developmentCardsPurchasedThisTurn,
    playedDevelopmentCardIds: overrides.playedDevelopmentCardIds ?? player.playedDevelopmentCardIds,
    secondaryRolls: overrides.secondaryRolls ?? player.secondaryRolls,
  };
}
