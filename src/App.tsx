import { useState } from "react";

import GameStatus from "./components/GameStatus";
import GuildSelection from "./components/GuildSelection";

import { initialState } from "./game/engine/initialState";

import {
  selectGuild,
} from "./game/systems/guildSelection";

import type { GameState } from "./game/engine/GameState";
import type { GuildType } from "./game/engine/types";

function App() {
  const [game, setGame] = useState<GameState>(initialState);

  function handleGuildSelection(guild: GuildType) {
    const updatedGame = selectGuild(
      game,
      game.currentPlayerId,
      guild
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

      <GameStatus game={game} />
    </div>
  );
}

export default App;