import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { evaluateMilestones } from "../milestones/evaluateMilestones";
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
  const isMerchant =
    player.guild === "merchant";
  const merchantPassiveAvailable =
    isMerchant &&
    !player.guildPassiveUsedThisTurn;
  /*
   * Determine which resources will be paid.
   *
   * Normal player:
   *   ore + wheat + sheep
   *
   * Merchant with passive available:
   *   exactly two of the three required resources
   *
   * Merchant with all three resources:
   *   merchantKeepResource must specify which one is kept.
   */
  let paymentResources: Resource[];
  if (merchantPassiveAvailable) {
    const availableRequiredResources =
      DEVELOPMENT_CARD_RESOURCES.filter(
        (resource) =>
          player.resources[resource] >= 1
      );
    if (availableRequiredResources.length < 2) {
      return game;
    }
    /*
     * If the Merchant has all three resources,
     * the caller must specify which resource to keep.
     *
     * This prevents the system from silently choosing
     * for the player.
     */
    if (availableRequiredResources.length === 3) {
      if (
        merchantKeepResource === undefined ||
        !DEVELOPMENT_CARD_RESOURCES.includes(
          merchantKeepResource
        )
      ) {
        return game;
      }
      paymentResources =
        DEVELOPMENT_CARD_RESOURCES.filter(
          (resource) =>
            resource !== merchantKeepResource
        );
    } else {
      /*
       * Merchant has exactly two of the three
       * required resources.
       *
       * Pay those two directly.
       */
      paymentResources =
        availableRequiredResources;
    }
  } else {
    /*
     * Normal purchase.
     *
     * This also applies to a Merchant whose passive
     * has already been used this turn.
     */
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
        /*
         * The Merchant passive is consumed whenever
         * the Merchant receives the discounted price.
         */
        guildPassiveUsedThisTurn:
          merchantPassiveAvailable
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
  return evaluateMilestones({
    ...game,
    players: updatedPlayers,
    resourceBank: updatedResourceBank,
    developmentDeck: remainingDeck,
    eventLog: [
      ...game.eventLog,
      createEvent(
        "DEVELOPMENT_CARD_PURCHASED",
        `${player.name} purchased a development card.`
      ),
    ],
  });
}