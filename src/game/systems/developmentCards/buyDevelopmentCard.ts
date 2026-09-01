import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
import { getEffectiveDevelopmentCardCost } from "../../guilds/merchant/passive/getEffectiveDevelopmentCardCost.ts";
type Resource = keyof Resources;
const DEVELOPMENT_CARD_RESOURCES: Resource[] = [
  "ore",
  "wheat",
  "sheep",
];
export function buyDevelopmentCard(
  game: GameState,
  playerId: string,
  merchantKeepResource?: Resource
): GameState {
  if (game.phase !== "playing") {
    return game;
  }
  if (game.currentPlayerId !== playerId) {
    return game;
  }
  if (game.robberPending) {
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
  let paymentResources: Resource[];
  /*
   * Merchant's discounted development-card cost is resolved
   * by the Merchant passive module.
   *
   * Normal players continue to use the base-game cost.
   */
  if (
    player.guild === "merchant" &&
    !player.guildPassiveUsedThisTurn
  ) {
    const merchantCost =
      getEffectiveDevelopmentCardCost(
        player,
        merchantKeepResource
      );
    if (!merchantCost) {
      return game;
    }
    paymentResources = merchantCost;
  } else {
    const canPayNormalCost =
      DEVELOPMENT_CARD_RESOURCES.every(
        (resource) =>
          player.resources[resource] >= 1
      );
    if (!canPayNormalCost) {
      return game;
    }
    paymentResources =
      DEVELOPMENT_CARD_RESOURCES;
  }
  const [purchasedCard, ...remainingDeck] =
    game.developmentDeck;
  const updatedPlayers = game.players.map(
    (candidate) => {
      if (candidate.id !== playerId) {
        return candidate;
      }
      const updatedResources = {
        ...candidate.resources,
      };
      for (const resource of paymentResources) {
        updatedResources[resource] -= 1;
      }
      return {
        ...candidate,
        resources: updatedResources,
        developmentCards: [
          ...candidate.developmentCards,
          purchasedCard,
        ],
        developmentCardsPurchasedThisTurn: [
          ...candidate.developmentCardsPurchasedThisTurn,
          purchasedCard.id,
        ],
        guildPassiveUsedThisTurn:
          player.guild === "merchant" &&
            !candidate.guildPassiveUsedThisTurn
            ? true
            : candidate.guildPassiveUsedThisTurn,
        vp:
          purchasedCard.type === "victory_point"
            ? candidate.vp + 1
            : candidate.vp,
      };
    }
  );
  const updatedResourceBank = {
    ...game.resourceBank,
  };
  for (const resource of paymentResources) {
    updatedResourceBank[resource] += 1;
  }
  const playerReached15ViaVictoryPoint =
    purchasedCard.type === "victory_point" &&
    player.vp < 15 &&
    updatedPlayers.some(
      (candidate) =>
        candidate.id === playerId &&
        candidate.vp >= 15
    );
  return evaluateMilestones({
    ...game,
    players: updatedPlayers,
    resourceBank: updatedResourceBank,
    developmentDeck: remainingDeck,
    eventLog: [
      ...game.eventLog,
      createEvent(
        "DEVELOPMENT_CARD_PURCHASED",
        playerReached15ViaVictoryPoint
          ? `${player.name} purchased a Dev Card. (+1 VP)`
          : player.guild === "merchant" &&
            !player.guildPassiveUsedThisTurn
            ? `${player.name} purchased a Dev Card using the Merchant Passive.`
            : `${player.name} purchased a Dev Card.`
      )
    ],
  });
}