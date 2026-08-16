import { useState } from "react";
import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";
import PortBadge from "./PortBadge";
import HexTileView from "./HexTileView";
import BoardNodeView from "./BoardNodeView";
import BoardEdgeView from "./BoardEdgeView";
interface BoardViewProps {
  era: string;
  board: Board;
  settlements: Settlement[];
  cities: {
    nodeId: string;
    playerId: string;
  }[];
  roads: {
    id: string;
    edgeId: string;
    playerId: string;
  }[];
  onSelectNode?: (nodeId: string) => void;
  onSelectEdge?: (edgeId: string) => void;
  robberPending?: boolean;
  robberTileId?: string;
  onSelectTile?: (tileId: string) => void;
}
function BoardView({
  era,
  board,
  settlements,
  cities,
  roads,
  onSelectNode,
  onSelectEdge,
  robberPending = false,
  robberTileId,
  onSelectTile,
}: BoardViewProps) {
  const [hoveredEdge, setHoveredEdge] =
    useState<string | null>(null);
  const [hoveredNode, setHoveredNode] =
    useState<string | null>(null);
  return (
    <div
      style={{
        position: "relative",
        width: "800px",
        height: "600px",
      }}
    >
      {/* GAME BOARD */}
      <svg
        width="800"
        height="600"
        viewBox="-450 -400 900 800"
        style={{
          display: "block",
          width: "800px",
          height: "600px",
          background: robberPending
            ? "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), #3b82f6"
            : "#3b82f6",
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
          />
        ))}
        {/* EDGES */}
        {board.edges.map((edge) => {
          const nodeA =
            board.nodes.find(
              (node) => node.id === edge.nodeA
            );
          const nodeB =
            board.nodes.find(
              (node) => node.id === edge.nodeB
            );
          const road =
            roads.find(
              (road) => road.edgeId === edge.id
            );
          const port =
            board.ports.find(
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
        {/* PORT BADGES */}
        {board.ports.map((port) => {
          const a =
            board.nodes.find(
              (n) =>
                n.id === port.nodeIds[0]
            );
          const b =
            board.nodes.find(
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
            38 *
            direction;
          const badgeY =
            midY +
            normalY *
            38 *
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
        {/* NODES */}
        {board.nodes.map((node) => {
          const settlement =
            settlements.find(
              (s) => s.nodeId === node.id
            );
          const city =
            cities.find(
              (c) => c.nodeId === node.id
            );
          const isPortNode =
            board.ports.some(
              (p) =>
                p.nodeIds.includes(
                  node.id
                )
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
      </svg>
{era === "prosperity" && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      boxSizing: "border-box",
      borderRadius: "18px",
      pointerEvents: "none",
      border: "4px solid #9C7A32",
boxShadow: `
  inset 0 0 0 1px #D4B766,
  inset 0 0 0 3px #6F5424,
  inset 0 0 0 5px #B89545,
  0 0 12px rgba(184, 149, 69, 0.45),
  0 0 14px rgba(184, 149, 69, 0.22),
  0 4px 12px rgba(0, 0, 0, 0.32)
`,
    }}
  >
    {/* INNER DEPTH LINE */}
    <div
      style={{
        position: "absolute",
        inset: "5px",
        borderRadius: "13px",
        border: "1px solid rgba(231, 207, 143, 0.75)",
        boxShadow: `
          inset 0 0 0 1px rgba(91, 68, 27, 0.6),
          inset 0 0 0 3px rgba(212, 183, 102, 0.4)
        `,
      }}
    />
    {/* OUTER HIGHLIGHT */}
    <div
      style={{
        position: "absolute",
        inset: "2px",
        borderRadius: "15px",
        border: "1px solid rgba(235, 214, 158, 0.65)",
      }}
    />
  </div>
)}
    </div>
  );
}
export default BoardView;