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
      guildPassiveUsedThisTurn: false,
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
      developmentCardsPurchasedThisTurn: [],
      developmentCardPlayedThisTurn: false,
      playedDevelopmentCardIds: [],
      knightsPlayed: 0,
      superUnlocked: false,
      superUsed: false,
      secondaryRolls: [],
    },
    {
      id: "player-2",
      name: "Player B",
      guild: undefined,
      guildPassiveUsedThisTurn: false,
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
      developmentCardsPurchasedThisTurn: [],
      developmentCardPlayedThisTurn: false,
      playedDevelopmentCardIds: [],
      knightsPlayed: 0,
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
    // Players / Turn
    players,
    currentPlayerId:
      placementOrder[0],
    guildSelectionPlayerId:
      guildSelectionPlayer.id,
    turnNumber: 0,
    // Board / Economy
    board: STARTER_BOARD,
    resourceBank: {
      brick: 19,
      lumber: 19,
      wheat: 19,
      sheep: 19,
      ore: 19,
    },
    developmentDeck: [...DEVELOPMENT_CARD_DECK]
      .sort(() => Math.random() - 0.5),
    // Initial Placement
    placementStep: 0,
    placementOrder,
    placementAction: "settlement",
    // lastPlacedSettlementNodeId: undefined,
    // Dice / Turn Resolution
    // lastDiceRoll: undefined,
    // discardPendingPlayerIds: undefined,
    // Prosperity / Secondary Dice
    // secondaryRoll: undefined,
    secondaryRollPending: false,
    // Robber
    robberPending: false,
    robberTileId: desertTile!.id,
    // Year of Plenty
    yearOfPlentyPending: false,
    // yearOfPlentyFirstResource: undefined,
    // yearOfPlentyCardId: undefined,
    // Monopoly
    monopolyPending: false,
    // monopolyResource: undefined,
    // monopolyCardId: undefined,
    // Road Building
    roadBuildingPending: false,
    // roadBuildingCardId: undefined,
    roadBuildingRoadsPlaced: 0,
    // Game Progression
    phase: "guild_selection",
    era: "standard",
    // Achievements
    // longestRoadPlayerId: undefined,
    // largestArmyPlayerId: undefined,
    // Victory
    // winnerId: undefined,
    // Events
    eventLog: [],
  };
}