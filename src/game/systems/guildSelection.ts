import type { GameState } from "../engine/GameState";
import type { GuildType } from "../engine/types";
import { createEvent } from "../engine/createEvent";
export function selectGuild(
  game: GameState,
  playerId: string,
  guild: GuildType
): GameState {
  const player = game.players.find(
    (player) => player.id === playerId
  );
  if (!player) {
    return game;
  }
  const updatedPlayers = game.players.map(
    (player) =>
      player.id === playerId
        ? {
            ...player,
            guild,
          }
        : player
  );
  const updatedGame: GameState = {
    ...game,
    players: updatedPlayers,
    eventLog: [
      ...game.eventLog,
      createEvent(
        "GUILD_SELECTED",
        `${player.name} selected ${guild.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())} Guild.`
      ),
    ],
  };
  return advanceGuildSelection(updatedGame);
}
function advanceGuildSelection(
  game: GameState
): GameState {
  const selectionComplete =
    game.players.every(
      (player) =>
        player.guild !== undefined
    );
  if (selectionComplete) {
    return {
      ...game,
      phase: "initial_placement",
      currentPlayerId:
        game.placementOrder[0],
      placementStep: 0,
    };
  }
  const nextPlayer =
    game.players.find(
      (player) =>
        player.guild === undefined
    );
  return {
    ...game,
    currentPlayerId:
      nextPlayer?.id ??
      game.currentPlayerId,
  };
}
export function isGuildSelectionComplete(
  game: GameState
): boolean {
  return game.players.every(
    (player) =>
      player.guild !== undefined
  );
}