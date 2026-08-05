import type { GameState } from "../engine/GameState";
import type { GuildType } from "../engine/types";

export function selectGuild(
  game: GameState,
  playerId: string,
  guild: GuildType
): GameState {
  const player = game.players.find(
    (player) => player.id === playerId
  );

  if (!player || player.guild !== undefined) {
    return game;
  }

  const guildTaken = game.players.some(
    (player) => player.guild === guild
  );

  if (guildTaken) {
    return game;
  }

  const updatedPlayers = game.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          guild,
        }
      : player
  );

  const updatedGame = {
    ...game,
    players: updatedPlayers,
  };

  return advanceGuildSelection(updatedGame);
}

function advanceGuildSelection(
  game: GameState
): GameState {

  const selectionComplete = game.players.every(
    (player) => player.guild !== undefined
  );

  if (selectionComplete) {
    return {
      ...game,
      phase: "initial_placement",
    };
  }

  const nextPlayer = game.players.find(
    (player) => player.guild === undefined
  );

  return {
    ...game,
    currentPlayerId: nextPlayer?.id ?? game.currentPlayerId,
  };
}

export function isGuildSelectionComplete(
  game: GameState
): boolean {
  return game.players.every(
    (player) => player.guild !== undefined
  );
}