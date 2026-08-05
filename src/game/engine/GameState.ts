import type { Player } from "./types";

export type GamePhase =
  | "guild_selection"
  | "initial_placement"
  | "playing"
  | "game_over";

export interface GameEvent {
  id: string;
  type: string;
  message: string;
  timestamp: number;
}

export interface GameState {
  players: Player[];

  currentPlayerId: string;

  guildSelectionPlayerId: string;

  turnNumber: number;

  phase: GamePhase;

  eraOfProsperity: boolean;

  prosperityTriggeredBy?: string;

  winnerId?: string;

  eventLog: GameEvent[];
}