import { useState } from "react";
import type { Board } from "../../game/domain/Board";
import type { Settlement } from "../../game/domain/Settlement";
import BoardEdgeView from "../BoardEdgeView";
import BoardNodeView from "../BoardNodeView";
import HexTileView from "../HexTileView";
import PortBadge from "../PortBadge";
interface BoardSurfaceProps {
  board: Board;
  settlements: Settlement[];
  cities: { nodeId: string; playerId: string }[];
  roads: { id: string; edgeId: string; playerId: string }[];
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  robberPending?: boolean;
  robberTileId?: string;
  onSelectTile?: (tileId: string) => void;
  playerColor?: string;
  winnerRevealing?: boolean;
}
export default function BoardSurface({
  board, settlements, cities, roads, onSelectNode, onSelectEdge,
  robberPending = false, robberTileId, onSelectTile, playerColor, winnerRevealing = false,
}: BoardSurfaceProps) {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  return (
    <svg
  width="800"
  height="600"
  viewBox="-450 -400 900 800"
  className="board-surface"
  style={{
    display: "block",
    background: robberPending || winnerRevealing
      ? "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), #3b82f6"
      : "#234b50",
    borderRadius: "18px",
  }}
>
  {/* HEXES */}
  {board.tiles.map((tile) => (
    <HexTileView
      key={tile.id}
      tile={tile}
      robberPending={robberPending}
      robberTileId={robberTileId}
      onSelectTile={onSelectTile}
      playerColor={playerColor}
    />
  ))}
  {/* EDGES */}
  {board.edges.map((edge) => {
    const nodeA = board.nodes.find(
      (node) => node.id === edge.nodeA
    );
    const nodeB = board.nodes.find(
      (node) => node.id === edge.nodeB
    );
    const road = roads.find(
      (road) => road.edgeId === edge.id
    );
    const port = board.ports.find(
      (port) => port.edgeId === edge.id
    );
    return (
      <BoardEdgeView
        key={edge.id}
        edge={edge}
        nodeA={nodeA}
        nodeB={nodeB}
        road={road}
        port={port}
        hovered={
          hoveredEdge === edge.id
        }
        onHover={setHoveredEdge}
        onSelectEdge={onSelectEdge}
      />
    );
  })}
  {/* NODES */}
  {board.nodes.map((node) => {
    const settlement =
      settlements.find(
        (s) => s.nodeId === node.id
      );
    const city = cities.find(
      (c) => c.nodeId === node.id
    );
    const isPortNode =
      board.ports.some(
        (p) =>
          p.nodeIds.includes(node.id)
      );
    return (
      <BoardNodeView
        key={node.id}
        node={node}
        settlement={settlement}
        city={city}
        isPortNode={isPortNode}
        hovered={
          hoveredNode === node.id
        }
        onHover={setHoveredNode}
        onSelectNode={onSelectNode}
      />
    );
  })}
  {/* ROBBER SELECTION INDICATORS */}
  {robberPending &&
    board.tiles.map((tile) => {
      const isRobberTile =
        robberTileId === tile.id;
      if (isRobberTile) {
        return null;
      }
      return (
        <g
          key={`robber-indicator-${tile.id}`}
          pointerEvents="none"
        >
          <circle
            cx={tile.x}
            cy={tile.y - 34}
            r="13"
            fill="#ef4444"
            stroke="#111827"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              values="17;23;17"
              dur="1.7s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1.7s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={tile.x}
            y={tile.y - 26}
            textAnchor="middle"
            fontSize="23"
            fill="#8B0000"
            fontWeight="bold"
          >
            ?
          </text>
        </g>
      );
    })}
  {/* PORT BADGES */}
  {board.ports.map((port) => {
    const a = board.nodes.find(
      (n) =>
        n.id === port.nodeIds[0]
    );
    const b = board.nodes.find(
      (n) =>
        n.id === port.nodeIds[1]
    );
    if (!a || !b) {
      return null;
    }
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const edgeLength = Math.sqrt(
      dx * dx + dy * dy
    );
    // Perpendicular direction
    const normalX = -dy / edgeLength;
    const normalY = dx / edgeLength;
    // Determine outward side
    const direction =
      midX * normalX +
        midY * normalY >
        0
        ? 1
        : -1;
    const badgeX =
      midX +
      normalX *
      54 *
      direction;
    const badgeY =
      midY +
      normalY *
      54 *
      direction;
    return (
      <PortBadge
        key={port.id}
        x={badgeX}
        y={badgeY}
        type={port.type}
        ratio={port.ratio}
      />
    );
  })}
    </svg>
  );
}
