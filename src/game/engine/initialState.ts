import type { GameState } from "./GameState";
import { getRandomStartingPlayer } from "../systems/playerOrder";

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

  const startingPlayer = getRandomStartingPlayer(players);

  return {
    players,

    guildSelectionPlayerId: startingPlayer.id,
    
    currentPlayerId: getRandomStartingPlayer(players).id,

    phase: "guild_selection",

    turnNumber: 0,

    eraOfProsperity: false,

    eventLog: [],
  };
}
