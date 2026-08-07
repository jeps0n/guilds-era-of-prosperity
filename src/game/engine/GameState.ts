import type { Player, Resources } from "./types";
import type { Board } from "../domain/Board";
export type GamePhase =
  | "guild_selection"
  | "initial_placement"
  | "playing"
  | "game_over";
export type PlacementAction =
  | "settlement"
  | "road";
export type GameEventType =
  | "GAME_STARTED"
  | "GUILD_SELECTED"
  | "SETTLEMENT_BUILT"
  | "ROAD_PLACED"
  | "PLAYER_REACHED_6VP"
  | "ERA_STARTED"
  | "SUPER_UNLOCKED"
  | "SUPER_ACTIVATED"
  | "PLAYER_REACHED_15VP"
  | "GAME_ENDED";
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
  resourceBank: Resources;
  placementStep: number;
  placementOrder: string[];
  placementAction: PlacementAction;
  lastPlacedSettlementNodeId?: string;
  turnNumber: number;
  lastDiceRoll?: number;
  phase: GamePhase;
  eraOfProsperity: boolean;
  prosperityTriggeredBy?: string;
  winnerId?: string;
  eventLog: GameEvent[];
}