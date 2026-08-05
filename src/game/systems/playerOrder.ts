import type { Player } from "../engine/types";

export function getRandomStartingPlayer(players: Player[]): Player {
  return players[Math.floor(Math.random() * players.length)];
}