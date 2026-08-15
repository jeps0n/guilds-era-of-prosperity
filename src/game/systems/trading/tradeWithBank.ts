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
  if (game.phase !== "playing") {
    return game;
  }
  if (game.currentPlayerId !== playerId) {
    return game;
  }
  if (game.lastDiceRoll === undefined) {
    return game;
  }
  if (giveResource === receiveResource) {
    return game;
  }
  const player = game.players.find(
    (candidate) => candidate.id === playerId
  );
  if (!player) {
    return game;
  }
  const ratio =
    player.guild === "merchant"
      ? getEffectiveTradeRatio(
          game,
          playerId,
          giveResource
        )
      : getTradeRatio(
          game,
          playerId,
          giveResource
        );
  if (player.resources[giveResource] < ratio) {
    return game;
  }
  if (game.resourceBank[receiveResource] < 1) {
    return game;
  }
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
          candidate.guild === "merchant"
            ? true
            : candidate.guildPassiveUsedThisTurn,
      };
    }
  );
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
    eventLog: [
      ...game.eventLog,
      createEvent(
        "BANK_TRADE",
        `${player.name} traded [${giveResource}] ${ratio} for [${receiveResource}] 1.`
      ),
    ],
  };
}