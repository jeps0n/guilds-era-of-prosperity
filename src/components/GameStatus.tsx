import type { GameState } from "../game/engine/GameState";

interface GameStatusProps {
  game: GameState;
}

function GameStatus({ game }: GameStatusProps) {
  return (
    <div>
      <h2>Game Status</h2>

      <p>
        Phase: <strong>{game.phase}</strong>
      </p>

      {game.phase === "initial_placement" && (
      <p>
        Placement Step:{" "}
        <strong>{game.placementStep}</strong>
      </p>
)}

      <p>
        Era of Prosperity:{" "}
        <strong>
          {game.eraOfProsperity ? "Active" : "Not Started"}
        </strong>
      </p>

      <hr />

      {game.players.map((player) => (
        <div key={player.id}>
          <h3>{player.name}</h3>

          <p>
            VP: {player.vp}
          </p>

          <p>
            Guild: {player.guild ?? "Not Selected"}
          </p>

          <p>
            Resources:
            <br />
            🧱 {player.resources.brick}{" "}
            🌲 {player.resources.lumber}{" "}
            🌾 {player.resources.wheat}{" "}
            🐑 {player.resources.sheep}{" "}
            ⛰️ {player.resources.ore}
          </p>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default GameStatus;