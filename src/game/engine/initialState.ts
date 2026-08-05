import type { GameState } from "./GameState";
import type { Player } from "./types";

const startingResources = {
  brick: 0,
  lumber: 0,
  wheat: 0,
  sheep: 0,
  ore: 0,
};

const playerA: Player = {
  id: "player-1",
  name: "Player A",

  vp: 0,

  resources: {
    ...startingResources,
  },

  roads: [],
  settlements: [],
  cities: [],

  superUnlocked: false,
  superUsed: false,

  secondaryRolls: [],
};

const playerB: Player = {
  id: "player-2",
  name: "Player B",

  vp: 0,

  resources: {
    ...startingResources,
  },

  roads: [],
  settlements: [],
  cities: [],

  superUnlocked: false,
  superUsed: false,

  secondaryRolls: [],
};

export const initialState: GameState = {
  players: [
    playerA,
    playerB,
  ],

  currentPlayerId: "player-1",

  turnNumber: 0,

  phase: "guild_selection",

  eraOfProsperity: false,

  prosperityTriggeredBy: undefined,

  winnerId: undefined,

  eventLog: [
    {
      id: "event-1",
      type: "GAME_STARTED",
      message: "Guilds: Era of Prosperity has begun.",
      timestamp: Date.now(),
    },
  ],
};