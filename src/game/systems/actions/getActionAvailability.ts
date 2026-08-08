import type { GameState } from "../../engine/GameState";
export interface ActionAvailability {
  canRollDice: boolean;
  canTrade: boolean;
  canRoad: boolean;
  canSettlement: boolean;
  canCity: boolean;
  canBuyDevelopment: boolean;
  canEndTurn: boolean;
}
export function getActionAvailability(
  game: GameState
): ActionAvailability {
  const currentPlayer = game.players.find(
    (player) => player.id === game.currentPlayerId
  );
  if (!currentPlayer) {
    return {
      canRollDice: false,
      canTrade: false,
      canRoad: false,
      canSettlement: false,
      canCity: false,
      canBuyDevelopment: false,
      canEndTurn: false,
    };
  }
  const resources = currentPlayer.resources;
  const canRoad =
    resources.brick >= 1 &&
    resources.lumber >= 1;
  const canSettlement =
    resources.brick >= 1 &&
    resources.lumber >= 1 &&
    resources.wheat >= 1 &&
    resources.sheep >= 1;
  const canCity =
    resources.ore >= 3 &&
    resources.wheat >= 2;
  const canBuyDevelopment =
    resources.ore >= 1 &&
    resources.wheat >= 1 &&
    resources.sheep >= 1 &&
    game.developmentDeck.length > 0;
  return {
    canRollDice:
      game.phase === "playing" &&
      game.lastDiceRoll === undefined,
    // Trade is visible but trading functionality
    // has not been implemented yet.
    canTrade:
      game.phase === "playing",
    canRoad:
      game.phase === "playing" &&
      canRoad,
    canSettlement:
      game.phase === "playing" &&
      canSettlement,
    canCity:
      game.phase === "playing" &&
      canCity,
    canBuyDevelopment:
      game.phase === "playing" &&
      canBuyDevelopment,
    canEndTurn:
      game.phase === "playing" &&
      game.lastDiceRoll !== undefined,
  };
}