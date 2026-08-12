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
  | "INITIAL_SETTLEMENT_PLACED"
  | "INITIAL_ROAD_PLACED"
  | "SETTLEMENT_BUILT"
  | "ROAD_PLACED"
  | "CITY_BUILT"
  | "DICE_ROLLED"
  | "RESOURCES_COLLECTED"
  | "RESOURCES_DISCARDED"
  | "BANK_TRADE"
  | "PORT_TRADE"
  | "DEVELOPMENT_CARD_PURCHASED"
  | "DEVELOPMENT_CARD_PLAYED"
  | "ROBBER_MOVED"
  | "RESOURCE_STOLEN"
  | "LONGEST_ROAD_CLAIMED"
  | "LARGEST_ARMY_CLAIMED"
  | "PLAYER_REACHED_6VP"
  | "ERA_STARTED"
  | "SUPER_UNLOCKED"
  | "SUPER_ACTIVATED"
  | "PLAYER_REACHED_15VP"
  | "GAME_ENDED";
export interface GameEvent {
  id: string;
  type: GameEventType;
  message: string;
  timestamp: number;
}
export interface GameState {
  players: Player[];
  currentPlayerId: string;
  guildSelectionPlayerId: string;
  board: Board;
  resourceBank: Resources;
  developmentDeck: {
    id: string;
    type:
    | "knight"
    | "victory_point"
    | "road_building"
    | "year_of_plenty"
    | "monopoly";
  }[];
  placementStep: number;
  placementOrder: string[];
  placementAction: PlacementAction;
  lastPlacedSettlementNodeId?: string;
  turnNumber: number;
  lastDiceRoll?: number;
  discardPendingPlayerIds?: string[];
  robberPending: boolean;
  yearOfPlentyPending: boolean;
  yearOfPlentyFirstResource?: keyof Resources;
  yearOfPlentyCardId?: string;
  monopolyPending: boolean;
  monopolyResource?: keyof Resources;
  monopolyCardId?: string;
  roadBuildingPending: boolean;
  // roadBuildingCardId?: string;
  // roadBuildingRoadsPlaced: number;
  robberTileId?: string;
  phase: GamePhase;
  eraOfProsperity: boolean;
  prosperityTriggeredBy?: string;
  winnerId?: string;
  eventLog: GameEvent[];
}