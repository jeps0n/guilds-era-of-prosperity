import { useState } from "react";
import ActionBar from "./components/ActionBar";
import BoardView from "./components/BoardView";
import GameLog from "./components/GameLog";
import GameStatus from "./components/GameStatus";
import GuildSelection from "./components/GuildSelection";
import GameLayout from "./components/layout/GameLayout";
// import InitialPlacement from "./components/InitialPlacement";
import PlayerPanel from "./components/PlayerPanel";
import { createInitialState } from "./game/engine/initialState";
import {
  validateBoard,
} from "./game/engine/boardValidation/validateBoard";
import {
  selectGuild,
} from "./game/systems/guildSelection";
import {
  placeSettlement,
} from "./game/systems/initialPlacement/placeSettlement";
import {
  placeRoad,
} from "./game/systems/initialPlacement/placeRoad";
import {
  endTurn,
} from "./game/systems/turn/endTurn";
import type { GuildType } from "./game/engine/types";
import {
  savePhaseCheckpoint,
  restorePhaseCheckpoint,
  canRestorePhaseCheckpoint,
} from "./store/gameStore";
const initialGame =
  createInitialState();
if (import.meta.env.DEV) {
  validateBoard(
    initialGame.board
  );
}
function App() {
  const [game, setGame] =
    useState(initialGame);
  function handleGuildSelection(
    guild: GuildType
  ) {
    const nextGame =
      selectGuild(
        game,
        game.currentPlayerId,
        guild
      );
    if (nextGame === game) {
      return;
    }
    savePhaseCheckpoint(game);
    setGame(nextGame);
    if (
      nextGame.phase !==
      game.phase
    ) {
      savePhaseCheckpoint(
        nextGame
      );
    }
  }
  function handlePlaceSettlement(
    nodeId: string
  ) {
    const nextGame =
      placeSettlement(
        game,
        game.currentPlayerId,
        nodeId
      );
    if (nextGame === game) {
      return;
    }
    savePhaseCheckpoint(game);
    setGame(nextGame);
  }
  function handlePlaceRoad(
    edgeId: string
  ) {
    const nextGame =
      placeRoad(
        game,
        game.currentPlayerId,
        edgeId
      );
    if (nextGame === game) {
      return;
    }
    setGame(nextGame);
    if (
      nextGame.phase !==
      game.phase
    ) {
      savePhaseCheckpoint(
        nextGame
      );
    }
  }
  function handleEndTurn() {
    const nextGame =
      endTurn(game);
    if (nextGame === game) {
      return;
    }
    setGame(nextGame);
    savePhaseCheckpoint(
      nextGame
    );
  }
  function handleRestoreCheckpoint() {
    const restoredGame =
      restorePhaseCheckpoint(
        game
      );
    if (!restoredGame) {
      return;
    }
    setGame(restoredGame);
  }
  const currentPlayer =
    game.players.find(
      (player) =>
        player.id ===
        game.currentPlayerId
    );
  const availableGuilds: GuildType[] =
    (
      [
        "builder",
        "explorer",
        "merchant",
      ] as GuildType[]
    ).filter(
      (guild) =>
        !game.players.some(
          (player) =>
            player.guild === guild
        )
    );
  const roads =
    game.players.flatMap(
      (player) =>
        player.roads.map(
          (edgeId, index) => ({
            id:
              `${player.id}-road-${index}`,
            edgeId,
            playerId:
              player.id,
          })
        )
    );
  const restoreAvailable =
    canRestorePhaseCheckpoint(
      game
    );
  /*
   * GUILD SELECTION
   *
   * Only show:
   * - Guild selection
   * - Game log
   * - Game status / Turn Back
   */
  if (
    game.phase ===
    "guild_selection" &&
    currentPlayer &&
    currentPlayer.guild ===
    undefined
  ) {
    return (
      <GameLayout
        header={
          <h1
            style={{
              margin: "8px 0 16px",
              fontSize: "24px",
            }}
          >
            Guilds: Era of Prosperity
          </h1>
        }
        board={
          <GuildSelection
            playerName={
              currentPlayer.name
            }
            availableGuilds={
              availableGuilds
            }
            onSelectGuild={
              handleGuildSelection
            }
          />
        }
        rightSidebar={
          <>
            <GameLog
              game={game}
            />
            <GameStatus
              game={game}
              onEndTurn={
                handleEndTurn
              }
              onRestoreCheckpoint={
                handleRestoreCheckpoint
              }
              canRestoreCheckpoint={
                restoreAvailable
              }
            />
          </>
        }
      />
    );
  }
  /*
   * INITIAL PLACEMENT / PLAYING
   *
   * Show:
   * - Board
   * - Placement status when applicable
   * - Game log
   * - Game status / Turn Back
   * - Player panel
   * - Action bar
   */
  return (
    <GameLayout
      header={
        <h1
          style={{
            margin: "8px 0 16px",
            fontSize: "24px",
          }}
        >
          Guilds: Era of Prosperity
        </h1>
      }
      board={
        <>
          <BoardView
            board={game.board}
            settlements={
              game.players.flatMap(
                (player) =>
                  player.settlements
              )
            }
            roads={roads}
            onSelectNode={
              game.phase ===
                "initial_placement" &&
                game.placementAction ===
                "settlement"
                ? handlePlaceSettlement
                : undefined
            }
            onSelectEdge={
              game.phase ===
                "initial_placement" &&
                game.placementAction ===
                "road"
                ? handlePlaceRoad
                : undefined
            }
          />
          {/* {game.phase ===
            "initial_placement" && (
              <InitialPlacement
                game={game}
              />
            )} */}
        </>
      }
      rightSidebar={
        <>
          <GameLog
            game={game}
          />
          <GameStatus
            game={game}
            onEndTurn={
              handleEndTurn
            }
            onRestoreCheckpoint={
              handleRestoreCheckpoint
            }
            canRestoreCheckpoint={
              restoreAvailable
            }
          />
          <PlayerPanel
            game={game}
          />
        </>
      }
      bottom={
        <ActionBar
          phase={game.phase}
          placementAction={
            game.placementAction
          }
          onEndTurn={
            handleEndTurn
          }
        />
      }
    />
  );
}
export default App;