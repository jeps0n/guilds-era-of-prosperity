import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";

interface BoardViewProps {
  board: Board;
  settlements: Settlement[];
  roads: {
    id: string;
    edgeId: string;
  }[];
  onSelectNode?: (nodeId: string) => void;
}

const SIZE = 75;


function hexPoints(
  x: number,
  y: number
) {
  return Array.from(
    { length: 6 },
    (_, i) => {

      const angle =
        Math.PI / 180 *
        (30 + i * 60);

      return [
        x + SIZE * Math.cos(angle),
        y + SIZE * Math.sin(angle),
      ].join(",");

    }
  ).join(" ");
}


function BoardView({
  board,
  settlements,
  roads,
  onSelectNode,
}: BoardViewProps) {

return (
  <div>
    <svg
      width="800"
      height="600"
      viewBox="-375 -333 750 666"
      style={{
        background: "#3b82f6",
        borderRadius: "18px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
      }}
    >

        {/* TERRAIN */}
        {board.tiles.map((tile) => (

          <g key={tile.id}>

            <polygon
              points={
                hexPoints(
                  tile.x,
                  tile.y
                )
              }
              fill={
                {
                  brick: "#b45309",
                  lumber: "#166534",
                  wheat: "#eab308",
                  sheep: "#65a30d",
                  ore: "#6b7280",
                  desert: "#d6c28a",
                }[tile.resource]
              }
              stroke="#111827"
              strokeWidth="2"
            />

            {tile.numberToken && (
              <rect
                x={tile.x - 18}
                y={tile.y - 14}
                width="36"
                height="28"
                rx="8"
                fill="#f9fafb"
                stroke="#111827"
                strokeWidth="2"
              />
            )}

            {tile.numberToken && (
              <text
                x={tile.x}
                y={tile.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fontWeight="bold"
                fill="#111827"
              >
                {tile.numberToken}
              </text>
            )}

          </g>

        ))}


        {/* ROADS */}
        {board.edges.map((edge) => {

          const a =
            board.nodes.find(
              (node) =>
                node.id === edge.nodeA
            );

          const b =
            board.nodes.find(
              (node) =>
                node.id === edge.nodeB
            );


          if (!a || !b) {
            return null;
          }


          const road =
            roads.find(
              (item) =>
                item.edgeId === edge.id
            );


          return (
            <line
              key={edge.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={
                road
                  ? "red"
                  : "#78350f"
              }
              strokeWidth={
                road
                  ? "10"
                  : "5"
              }
            />
          );

        })}



        {/* NODES */}
        {board.nodes.map((node) => {

          const settlement =
            settlements.find(
              (item) =>
                item.nodeId === node.id
            );


          return (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r="9"
              fill={
                settlement
                  ? "#ef4444"
                  : "#2563eb"
              }
              stroke="white"
              strokeWidth="2"
              onClick={() =>
                onSelectNode?.(node.id)
              }
              style={{
                cursor: "pointer",
              }}
            />
          );

        })}

    </svg>
  </div>
);
}


export default BoardView;