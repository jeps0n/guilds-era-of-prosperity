import { useState } from "react";
import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";
interface BoardViewProps {
  board: Board;
  settlements: Settlement[];
  roads: {
    id: string;
    edgeId: string;
    playerId: string;
  }[];
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
}
const SIZE = 75;
function hexPoints(x: number, y: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle =
      (Math.PI / 180) * (30 + i * 60);
    return [
      x + SIZE * Math.cos(angle),
      y + SIZE * Math.sin(angle),
    ].join(",");
  }).join(" ");
}
function BoardView({
  board,
  settlements,
  roads,
  onSelectNode,
  onSelectEdge,
}: BoardViewProps) {
  const [hoveredEdge, setHoveredEdge] =
    useState<string | null>(null);
  const [hoveredNode, setHoveredNode] =
    useState<string | null>(null);
  return (
    <svg
      width="800"
      height="600"
      viewBox="-375 -333 750 666"
      style={{
        background: "#3b82f6",
        borderRadius: "18px",
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.35)",
      }}
    >
      {/* HEXES */}
      {board.tiles.map((tile) => (
        <g key={tile.id}>
          <polygon
            points={hexPoints(tile.x, tile.y)}
            fill={{
              brick: "#b45309",
              lumber: "#166534",
              wheat: "#eab308",
              sheep: "#65a30d",
              ore: "#6b7280",
              desert: "#d6c28a",
            }[tile.resource]}
            stroke="#111827"
            strokeWidth="2"
          />
          {tile.numberToken && (
            <>
              <rect
                x={tile.x - 18}
                y={tile.y - 18}
                width="36"
                height="36"
                rx="8"
                fill="#f9fafb"
                stroke="#111827"
                strokeWidth="2"
              />
              <text
                x={tile.x}
                y={tile.y + 6}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="18"
              >
                {tile.numberToken}
              </text>
            </>
          )}
          <text
            x={tile.x}
            y={tile.y + 38}
            textAnchor="middle"
            fontSize="10"
            fill="white"
            fontWeight="bold"
          >
            {tile.resource}
          </text>
        </g>
      ))}
      {/* ROADS */}
      {board.edges.map((edge) => {
        const a =
          board.nodes.find(
            (n) => n.id === edge.nodeA
          );
        const b =
          board.nodes.find(
            (n) => n.id === edge.nodeB
          );
        if (!a || !b)
          return null;
        const road =
          roads.find(
            (r) =>
              r.edgeId === edge.id
          );
        const port =
          board.ports.find(
            p => p.edgeId === edge.id
          );
        const hovered =
          hoveredEdge === edge.id;
        const isPortEdge =
          board.ports.some(
            (port) =>
              port.nodeIds.includes(edge.nodeA) &&
              port.nodeIds.includes(edge.nodeB)
          );

        return (
          <g key={edge.id}>
            {/* PORT DEBUG EDGE */}
            {isPortEdge && (
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#CD7F32"
                strokeWidth="14"
                strokeLinecap="round"
                pointerEvents="none"
              />
            )}
            {port && (
              <path
                d={portArcPath(
                  a.x,
                  a.y,
                  b.x,
                  b.y
                )}
                fill="#CD7F32"
                stroke="#CD7F32"
                strokeWidth="10"
                strokeLinecap="round"
                pointerEvents="none"
              />
            )}
            {road ? (
              <>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#000000"
                  strokeWidth="15"
                  strokeLinecap="round"
                  pointerEvents="none"
                />
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={
                    hovered
                      ? "#ff0000"
                      : road.playerId === "player-1"
                        ? "#f97316"
                        : "#9333ea"
                  }
                  strokeWidth="8"
                  strokeLinecap="round"
                  pointerEvents="none"
                />
              </>
            ) : (
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={
                  hovered
                    ? "#ff0000"
                    : "#78350f"
                }
                strokeWidth={
                  hovered
                    ? 10
                    : 6
                }
                strokeLinecap="round"
                pointerEvents="none"
              />
            )}
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="transparent"
              strokeWidth="22"
              onMouseEnter={() =>
                setHoveredEdge(edge.id)
              }
              onMouseLeave={() =>
                setHoveredEdge(null)
              }
              onClick={() =>
                onSelectEdge?.(edge.id)
              }
              style={{
                cursor:
                  onSelectEdge
                    ? "pointer"
                    : "default",
              }}
            />
          </g>
        );
      })}
      {/* PORT LABELS */}
      {board.ports.map((port) => {
        const a =
          board.nodes.find(
            n =>
              n.id === port.nodeIds[0]
          );
        const b =
          board.nodes.find(
            n =>
              n.id === port.nodeIds[1]
          );
        if (!a || !b)
          return null;
        return (
          // PORT TEXT
          <text
            key={port.id}
            x={(a.x + b.x) / 2}
            y={(a.y + b.y) / 2 - 8}
            fill="#964B00"
            fontWeight="bold"
            fontSize="12"
            textAnchor="middle"
          >
            {port.type}
          </text>
        );
      })}
      {/* NODES */}
      {board.nodes.map((node) => {
        const settlement =
          settlements.find(
            (s) =>
              s.nodeId === node.id
          );
        const hovered =
          hoveredNode === node.id;
        const isPortNode =
          board.ports.some(
            (p) =>
              p.nodeIds.includes(node.id)
          );
        return (
          <g key={node.id}>
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
                  setHoveredNode(node.id)
                }
                onMouseLeave={() =>
                  setHoveredNode(null)
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
                      : "#2563eb"
                }
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() =>
                  setHoveredNode(node.id)
                }
                onMouseLeave={() =>
                  setHoveredNode(null)
                }
                onClick={() =>
                  onSelectNode?.(node.id)
                }
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
function portArcPath(
  ax: number,
  ay: number,
  bx: number,
  by: number
) {
  const dx = bx - ax;
  const dy = by - ay;

  const length = Math.sqrt(
    dx * dx + dy * dy
  );

  const radius = length / 2;

  return `
    M ${ax} ${ay}
    A ${radius} ${radius} 0 0 1 ${bx} ${by}
  `;
}
export default BoardView;