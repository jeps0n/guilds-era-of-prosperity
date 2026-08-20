import type { GameState } from "../../engine/GameState";
import type { Resources } from "../../engine/types";
import { createEvent } from "../../engine/createEvent";
import { getTradeRatio } from "./getTradeRatio";
import { getEffectiveTradeRatio } from "../../guilds/merchant/passive/getEffectiveTradeRatio";
export function tradeWithBank(
  game: GameState,
  playerId: string,
  giveResource: keyof Resources,
  receiveResource: keyof Resources
): GameState {
  // Bank trading is only allowed during the active play phase.
  if (game.phase !== "playing") {
    return game;
  }
  // Only the player whose turn it is can trade.
  if (game.currentPlayerId !== playerId) {
    return game;
  }
  // Trading is unlocked after the player rolls for the turn.
  if (game.lastDiceRoll === undefined) {
    return game;
  }
  // A trade must exchange different resource types.
  if (giveResource === receiveResource) {
    return game;
  }
  const player = game.players.find(
    (candidate) => candidate.id === playerId
  );
  if (!player) {
    return game;
  }
  // Base ratio comes from the player's actual port access: 4:1, 3:1, or 2:1.
  const baseRatio = getTradeRatio(
    game,
    playerId,
    giveResource
  );
  // Merchant can temporarily improve only a 4:1 bank trade to 3:1.
  const ratio =
    player.guild === "merchant"
      ? getEffectiveTradeRatio(
        game,
        playerId,
        giveResource
      )
      : baseRatio;
  // Player must be able to pay the effective trade ratio.
  if (player.resources[giveResource] < ratio) {
    return game;
  }
  // The bank must have the requested resource available.
  if (game.resourceBank[receiveResource] < 1) {
    return game;
  }
  // Merchant passive is consumed only when it actually upgrades 4:1 to 3:1.
  const usedMerchantPassive =
    player.guild === "merchant" &&
    !player.guildPassiveUsedThisTurn &&
    baseRatio === 4 &&
    ratio === 3;
  // Apply the trade and consume the Merchant passive only when it was used.
  const updatedPlayers = game.players.map(
    (candidate) => {
      if (candidate.id !== playerId) {
        return candidate;
      }
      return {
        ...candidate,
        resources: {
          ...candidate.resources,
          [giveResource]:
            candidate.resources[giveResource] - ratio,
          [receiveResource]:
            candidate.resources[receiveResource] + 1,
        },
        guildPassiveUsedThisTurn:
          usedMerchantPassive
            ? true
            : candidate.guildPassiveUsedThisTurn,
      };
    }
  );
  // Move the traded resources into the bank and the received resource to the player.
  const updatedResourceBank = {
    ...game.resourceBank,
    [giveResource]:
      game.resourceBank[giveResource] + ratio,
    [receiveResource]:
      game.resourceBank[receiveResource] - 1,
  };
  return {
    ...game,
    players: updatedPlayers,
    resourceBank: updatedResourceBank,
    // Record the completed bank trade for the game log.
    eventLog: [
      ...game.eventLog,
      createEvent(
        "BANK_TRADE",
        `${player.name} traded [${giveResource}] ${ratio} for [${receiveResource}] 1.`
      ),
    ],
  };
}