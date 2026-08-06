import type { GameState } from "../game/engine/GameState";
import Panel from "./ui/Panel";

interface GameStatusProps {
  game: GameState;
}

function GameStatus({
  game,
}: GameStatusProps) {

  const currentPlayer =
    game.players.find(
      (player) =>
        player.id === game.currentPlayerId
    );


return (
  <Panel>

      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "16px",
        }}
      >
        Game Status
      </h3>


      <div>
        <strong>Phase:</strong>{" "}
        {game.phase}
      </div>


      <div
        style={{
          marginTop: "6px",
        }}
      >
        <strong>Turn:</strong>{" "}
        {game.turnNumber}
      </div>


      <div
        style={{
          marginTop: "6px",
        }}
      >
        <strong>Current:</strong>{" "}
        {currentPlayer?.name}
      </div>

    </Panel>
  );
}

export default GameStatus;