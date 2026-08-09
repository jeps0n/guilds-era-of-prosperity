import type { BoardNode } from "../game/domain/BoardNode";
import type { Settlement } from "../game/domain/Settlement";
interface BoardNodeViewProps {
  node: BoardNode;
  settlement?: Settlement;
  city?: {
    nodeId: string;
    playerId: string;
  };
  isPortNode: boolean;
  hovered: boolean;
  onHover: (nodeId: string | null) => void;
  onSelectNode?: (nodeId: string) => void;
}
export default function BoardNodeView({
  node,
  settlement,
  city,
  isPortNode,
  hovered,
  onHover,
  onSelectNode,
}: BoardNodeViewProps) {
  return (
    <>
      {city ? (
        <>
          <polygon
            points={`
              ${node.x},${node.y - 27}
              ${node.x + 24},${node.y - 9}
              ${node.x + 16.5},${node.y + 24}
              ${node.x - 16.5},${node.y + 24}
              ${node.x - 24},${node.y - 9}
                    `}
            fill={
              hovered
                ? "#ef4444"
                : city.playerId === "player-1"
                  ? "#f97316"
                  : "#9333ea"
            }
            stroke="#000000"
            strokeWidth="5"
            onMouseEnter={() =>
              onHover(node.id)
            }
            onMouseLeave={() =>
              onHover(null)
            }
            onClick={() =>
              onSelectNode?.(node.id)
            }
            style={{
              filter: hovered
                ? "drop-shadow(0 0 6px #ef4444)"
                : "none",
            }}
          />
          <text
            x={node.x}
            y={node.y + 7}
            textAnchor="middle"
            fill="#000000"
            fontSize="18"
            fontWeight="normal"
            pointerEvents="none"
          >
            c
          </text>
        </>
      ) : settlement ? (
        <polygon
          points={`
              ${node.x},${node.y - 18}
              ${node.x + 16},${node.y - 6}
              ${node.x + 11},${node.y + 16}
              ${node.x - 11},${node.y + 16}
              ${node.x - 16},${node.y - 6}
                  `}
          fill={
            hovered
              ? "#ef4444"
              : settlement.playerId === "player-1"
                ? "#f97316"
                : "#9333ea"
          }
          stroke="#000000"
          strokeWidth="4"
          onMouseEnter={() =>
            onHover(node.id)
          }
          onMouseLeave={() =>
            onHover(null)
          }
          onClick={() =>
            onSelectNode?.(node.id)
          }
          style={{
            filter: hovered
              ? "drop-shadow(0 0 6px #ef4444)"
              : "none",
          }}
        />
      ) : (
        <circle
          cx={node.x}
          cy={node.y}
          r={hovered ? 13 : 9}
          fill={
            hovered
              ? "#ef4444"
              : isPortNode
                ? "#CD7F32"
                : "#557C99"
          }
          stroke="#c0c0c0"
          strokeWidth="2"
          onMouseEnter={() =>
            onHover(node.id)
          }
          onMouseLeave={() =>
            onHover(null)
          }
          onClick={() =>
            onSelectNode?.(node.id)
          }
          style={{
            filter: hovered
              ? "drop-shadow(0 0 6px #ef4444)"
              : "none",
          }}
        />
      )}
    </>
  );
}