import { useState } from "react";

import GameStatus from "./components/GameStatus";
import GuildSelection from "./components/GuildSelection";
import InitialPlacement from "./components/InitialPlacement";

import { createInitialState } from "./game/engine/initialState";

import {
  selectGuild,
} from "./game/systems/guildSelection";

import {
  placeSettlement,
} from "./game/systems/initialPlacement";

import type { GameState } from "./game/engine/GameState";
import type { GuildType } from "./game/engine/types";

import BoardView from "./components/BoardView";

function App() {
  const [game, setGame] = useState<GameState>(
    createInitialState()
  );

  function handleGuildSelection(guild: GuildType) {
    const updatedGame = selectGuild(
      game,
      game.currentPlayerId,
      guild
    );

    setGame(updatedGame);
  }
  
  function handlePlaceSettlement(nodeId: string) {
    const updatedGame = placeSettlement(
      game,
      game.currentPlayerId,
      nodeId
    );

    setGame(updatedGame);
  }

  const currentPlayer = game.players.find(
    (player) => player.id === game.currentPlayerId
  );

  const availableGuilds: GuildType[] = (
    [
      "builder",
      "explorer",
      "merchant",
    ] as GuildType[]
  ).filter(
    (guild) =>
      !game.players.some(
        (player) => player.guild === guild
      )
  );

  return (
    <div>
      <h1>Guilds: Era of Prosperity</h1>

      {game.phase === "guild_selection" &&
        currentPlayer &&
        currentPlayer.guild === undefined && (
          <GuildSelection
            playerName={currentPlayer.name}
            availableGuilds={availableGuilds}
            onSelectGuild={handleGuildSelection}
          />
        )}

      {game.phase === "initial_placement" && (
        <InitialPlacement
          game={game}
        />
      )}

      {game.phase !== "guild_selection" && (
        <BoardView
          board={game.board}
          settlements={game.players.flatMap(
            (player) => player.settlements
          )}
          onSelectNode={handlePlaceSettlement}
        />
      )}

      {game.phase !== "guild_selection" && (
        <GameStatus game={game} />
      )}

    </div>
  );
}

export default App;