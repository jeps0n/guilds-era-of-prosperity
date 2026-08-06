import type { Board } from "../game/domain/Board";

interface BoardViewProps {
  board: Board;
}

function BoardView({
  board,
}: BoardViewProps) {
  return (
    <div>
      <h2>🗺️ Board</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 120px)",
          gap: "12px",
        }}
      >
        {board.tiles.map((tile) => (
          <div
            key={tile.id}
            style={{
              border: "2px solid black",
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
              background:
                tile.resource === "desert"
                  ? "#d6b56c"
                  : "#86efac",
            }}
          >
            <div>
              {tile.resource === "lumber" && "🌲"}
              {tile.resource === "brick" && "🧱"}
              {tile.resource === "wheat" && "🌾"}
              {tile.resource === "sheep" && "🐑"}
              {tile.resource === "ore" && "⛰️"}
              {tile.resource === "desert" && "🏜️"}
            </div>

            <strong>
              {tile.resource}
            </strong>

            {tile.numberToken && (
              <div>
                {tile.numberToken}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardView;