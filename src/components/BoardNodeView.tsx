import type { BoardNode } from "../game/domain/BoardNode";
import type { Settlement } from "../game/domain/Settlement";
interface BoardNodeViewProps {
  node: BoardNode;
  settlement?: Settlement;
  isPortNode: boolean;
  hovered: boolean;
  onHover: (nodeId: string | null) => void;
  onSelectNode?: (nodeId: string) => void;
}
export default function BoardNodeView({
  node,
  settlement,
  isPortNode,
  hovered,
  onHover,
  onSelectNode,
}: BoardNodeViewProps) {
  return (
    <g>
      {settlement ? (
        <polygon
          points={`${node.x},${node.y - 18}
${node.x + 16},${node.y - 6}
${node.x + 11},${node.y + 16}
${node.x - 11},${node.y + 16}
${node.x - 16},${node.y - 6}`}
          fill={
            hovered
              ? "#ff0000"
              : settlement.playerId === "player-1"
                ? "#f97316"
                : "#9333ea"
          }
          stroke="#000"
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
        />
      ) : (
        <circle
          cx={node.x}
          cy={node.y}
          r={hovered ? 13 : 9}
          fill={
            hovered
              ? "#ff0000"
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
        />
      )}
    </g>
  );
}