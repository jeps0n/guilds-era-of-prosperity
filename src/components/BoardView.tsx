import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";

interface BoardViewProps {
  board: Board;
  settlements: Settlement[];
  onSelectNode?: (nodeId: string) => void;
}

function BoardView({
  board,
  settlements,
  onSelectNode,
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

            <strong>{tile.resource}</strong>

            {tile.numberToken && (
              <div>{tile.numberToken}</div>
            )}
          </div>
        ))}
      </div>

      <h3>Settlement Nodes</h3>

      <div
        style={{
          position: "relative",
          width: "600px",
          height: "300px",
          border: "2px dashed gray",
          marginTop: "20px",
        }}
      >
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          {board.edges.map((edge) => {
            const nodeA = board.nodes.find(
              (node) =>
                node.id === edge.nodeA
            );

            const nodeB = board.nodes.find(
              (node) =>
                node.id === edge.nodeB
            );

            if (!nodeA || !nodeB) {
              return null;
            }

            return (
              <line
                key={edge.id}
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke="black"
                strokeWidth="4"
              />
            );
          })}
        </svg>

        {board.nodes.map((node) => {
          const settlement = settlements.find(
            (item) => item.nodeId === node.id
          );

          return (
            <button
              key={node.id}
              onClick={() =>
                onSelectNode?.(node.id)
              }
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                transform:
                  "translate(-50%, -50%)",
                borderRadius: "50%",
                zIndex: 1,
              }}
            >
              {settlement ? "🏠" : "📍"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BoardView;