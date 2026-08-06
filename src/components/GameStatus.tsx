import type { GameState } from "../game/engine/GameState";

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
    <div
      style={{
        marginTop: "24px",
        padding: "16px",
        background: "#111827",
        borderRadius: "12px",
        color: "white",
        minWidth: "300px",
        textAlign: "center",
      }}
    >
      <div>
        Phase: {game.phase}
      </div>

      <div>
        Turn: {game.turnNumber}
      </div>

      <div>
        Current Player:
        {" "}
        {currentPlayer?.name ?? "None"}
      </div>
    </div>
  );
}

export default GameStatus;