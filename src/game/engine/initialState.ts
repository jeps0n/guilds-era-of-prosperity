import type { GameState } from "./GameState";
import { STARTER_BOARD } from "../data/starterBoard";

export function createInitialState(): GameState {
  const players = [
    {
      id: "player-1",
      name: "Player A",
      guild: undefined,
      vp: 0,
      resources: {
        brick: 0,
        lumber: 0,
        wheat: 0,
        sheep: 0,
        ore: 0,
      },
      roads: [],
      settlements: [],
      cities: [],
      superUnlocked: false,
      superUsed: false,
      secondaryRolls: [],
    },
    {
      id: "player-2",
      name: "Player B",
      guild: undefined,
      vp: 0,
      resources: {
        brick: 0,
        lumber: 0,
        wheat: 0,
        sheep: 0,
        ore: 0,
      },
      roads: [],
      settlements: [],
      cities: [],
      superUnlocked: false,
      superUsed: false,
      secondaryRolls: [],
    },
  ];

  const shuffledPlayers = [
    ...players,
  ].sort(() => Math.random() - 0.5);

  const placementOrder = [
    shuffledPlayers[0].id,
    shuffledPlayers[1].id,
    shuffledPlayers[1].id,
    shuffledPlayers[0].id,
  ];
  
  const guildSelectionPlayer =
  players[Math.floor(Math.random() * players.length)];

  return {
    players,

    board: STARTER_BOARD,

    guildSelectionPlayerId: guildSelectionPlayer.id,
    
    currentPlayerId: placementOrder[0],

    placementStep: 0,

    placementOrder,
    
    phase: "guild_selection",

    turnNumber: 0,

    eraOfProsperity: false,

    eventLog: [],
  };
}
