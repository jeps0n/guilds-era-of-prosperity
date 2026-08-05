import GameStatus from "./components/GameStatus";
import { initialState } from "./game/engine/initialState";

function App() {
  return (
    <div>
      <h1>Guilds: Era of Prosperity</h1>

      <GameStatus game={initialState} />
    </div>
  );
}

export default App;