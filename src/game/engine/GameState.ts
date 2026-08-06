import type { Player } from "./types";
import type { Board } from "../domain/Board";

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

  board: Board;

  placementStep: number;

  placementOrder: string[];

  turnNumber: number;

  phase: GamePhase;

  eraOfProsperity: boolean;

  prosperityTriggeredBy?: string;

  winnerId?: string;

  eventLog: GameEvent[];
}