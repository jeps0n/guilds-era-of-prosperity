import { useState } from "react";
import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";
import PortBadge from "./PortBadge";
import HexTileView from "./HexTileView";
import BoardNodeView from "./BoardNodeView";
import BoardEdgeView from "./BoardEdgeView";
interface BoardViewProps {
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
}
function BoardView({
  board,
  settlements,
  cities,
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
      viewBox="-450 -400 900 800"
      style={{
        background: "#3b82f6",
        borderRadius: "18px",
        boxShadow:
          "0 12px 30px rgba(0,0,0,0.35)",
      }}
    >
      {/* HEXES */}
      {board.tiles.map((tile) => (
        <HexTileView
          key={tile.id}
          tile={tile}
        />
      ))}
      {/* EDGES */}
      {board.edges.map((edge) => {
        const nodeA =
          board.nodes.find(
            (node) =>
              node.id === edge.nodeA
          );
        const nodeB =
          board.nodes.find(
            (node) =>
              node.id === edge.nodeB
          );
        const road =
          roads.find(
            (road) =>
              road.edgeId === edge.id
          );
        const port =
          board.ports.find(
            (port) =>
              port.edgeId === edge.id
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
            n =>
              n.id === port.nodeIds[0]
          );
        const b =
          board.nodes.find(
            n =>
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
        // perpendicular direction
        const normalX = -dy / edgeLength;
        const normalY = dx / edgeLength;
        // determine outward side
        const direction =
          (
            midX * normalX +
            midY * normalY
          ) > 0
            ? 1
            : -1;
        // this point matches the arc peak
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
        /* PORT BADGE*/
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
            (s) =>
              s.nodeId === node.id
          );
        const city =
          cities.find(
            (c) =>
              c.nodeId === node.id
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
            hovered={hoveredNode === node.id}
            onHover={setHoveredNode}
            onSelectNode={onSelectNode}
          />
        );
      })}
    </svg>
  );
}
export default BoardView;