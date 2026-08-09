import type { GameState } from "./GameState";
import { STARTER_BOARD } from "../data/starterBoard";
import {
  DEVELOPMENT_CARD_DECK,
} from "../data/developmentCards";
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
      tradeRatios: {
        brick: 4,
        lumber: 4,
        wheat: 4,
        sheep: 4,
        ore: 4,
      },
      roads: [],
      settlements: [],
      cities: [],
      developmentCards: [],
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
      tradeRatios: {
        brick: 4,
        lumber: 4,
        wheat: 4,
        sheep: 4,
        ore: 4,
      },
      roads: [],
      settlements: [],
      cities: [],
      developmentCards: [],
      superUnlocked: false,
      superUsed: false,
      secondaryRolls: [],
    },
  ];
  const shuffledPlayers =
    [...players].sort(() => Math.random() - 0.5);
  const placementOrder = [
    shuffledPlayers[0].id,
    shuffledPlayers[1].id,
    shuffledPlayers[1].id,
    shuffledPlayers[0].id,
  ];
  const guildSelectionPlayer =
    players[
    Math.floor(
      Math.random() * players.length
    )
    ];
  const desertTile = STARTER_BOARD.tiles.find(
    (tile) => tile.resource === "desert"
  );
  return {
    players,
    board: STARTER_BOARD,
    robberTileId: desertTile!.id,
    robberPending: false,
    resourceBank: {
      brick: 19,
      lumber: 19,
      wheat: 19,
      sheep: 19,
      ore: 19,
    },
    developmentDeck: [...DEVELOPMENT_CARD_DECK]
      .sort(() => Math.random() - 0.5),
    guildSelectionPlayerId:
      guildSelectionPlayer.id,
    currentPlayerId:
      placementOrder[0],
    placementStep: 0,
    placementOrder,
    placementAction: "settlement",
    phase: "guild_selection",
    turnNumber: 0,
    eraOfProsperity: false,
    eventLog: [],
  };
}