import type { Player, Resources } from "./types";
import type { Board } from "../domain/Board";
export type GamePhase =
  | "guild_selection"
  | "initial_placement"
  | "playing"
  | "game_over";
export type GameEra =
  | "standard"
  | "prosperity";
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
  | "SECONDARY_DICE_ROLLED"
  | "RESOURCES_COLLECTED"
  | "RESOURCES_DISCARDED"
  | "BANK_TRADE"
  | "PORT_TRADE"
  | "DEVELOPMENT_CARD_PURCHASED"
  | "DEVELOPMENT_CARD_PLAYED"
  | "YEAR_OF_PLENTY_RESOLVED"
  | "MONOPOLY_RESOLVED"
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
  // Players / Turn
  players: Player[];
  currentPlayerId: string;
  guildSelectionPlayerId: string;
  turnNumber: number;
  // Board / Economy
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
  // Initial Placement
  placementStep: number;
  placementOrder: string[];
  placementAction: PlacementAction;
  lastPlacedSettlementNodeId?: string;
  // Dice / Turn Resolution
  lastDiceRoll?: number;
  discardPendingPlayerIds?: string[];
  // Prosperity / Secondary Dice
  secondaryRoll?: number;
  secondaryRollPending: boolean;
  // Robber
  robberPending: boolean;
  robberTileId?: string;
  // Year of Plenty
  yearOfPlentyPending: boolean;
  yearOfPlentyFirstResource?: keyof Resources;
  yearOfPlentyCardId?: string;
  // Monopoly
  monopolyPending: boolean;
  monopolyResource?: keyof Resources;
  monopolyCardId?: string;
  // Road Building
  roadBuildingPending: boolean;
  roadBuildingCardId?: string;
  roadBuildingRoadsPlaced: number;
  // Grand Expedition
  grandExpeditionPending: boolean;
  grandExpeditionRoadsPlaced: number;
  grandExpeditionRoadsToPlace: number;
  // Master Builder
  masterBuilderPending: boolean;
  masterBuilderSelection?: "city" | "settlement";
  // Game Progression
  phase: GamePhase;
  era: GameEra;
  // Achievements
  longestRoadPlayerId?: string;
  largestArmyPlayerId?: string;
  // Victory
  winnerId?: string;
  // Events
  eventLog: GameEvent[];
}