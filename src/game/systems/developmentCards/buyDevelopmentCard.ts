import type { GameState } from "../../engine/GameState";
import { createEvent } from "../../engine/createEvent";
export function buyDevelopmentCard(
  game: GameState,
  playerId: string
): GameState {
  if (game.phase !== "playing") {
    return game;
  }
  if (game.currentPlayerId !== playerId) {
    return game;
  }
  if (game.lastDiceRoll === undefined) {
    return game;
  }
  if (game.developmentDeck.length === 0) {
    return game;
  }
  const player = game.players.find(
    (candidate) => candidate.id === playerId
  );
  if (!player) {
    return game;
  }
  if (
    player.resources.ore < 1 ||
    player.resources.wheat < 1 ||
    player.resources.sheep < 1
  ) {
    return game;
  }
  const [purchasedCard, ...remainingDeck] =
    game.developmentDeck;
  const updatedPlayers = game.players.map(
    (candidate) => {
      if (candidate.id !== playerId) {
        return candidate;
      }
      return {
        ...candidate,
        resources: {
          ...candidate.resources,
          ore: candidate.resources.ore - 1,
          wheat: candidate.resources.wheat - 1,
          sheep: candidate.resources.sheep - 1,
        },
        developmentCards: [
          ...candidate.developmentCards,
          purchasedCard,
        ],
      };
    }
  );
  return {
    ...game,
    players: updatedPlayers,
    developmentDeck: remainingDeck,
    eventLog: [
      ...game.eventLog,
      createEvent(
        "DEVELOPMENT_CARD_PURCHASED",
        `${player.name} purchased a development card.`
      ),
    ],
  };
}