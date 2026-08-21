import { useState, useEffect } from "react";
import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";
import PortBadge from "./PortBadge";
import HexTileView from "./HexTileView";
import BoardNodeView from "./BoardNodeView";
import BoardEdgeView from "./BoardEdgeView";
interface BoardViewProps {
  // Prosperity features
  era: string;
  secondaryRollPending?: boolean;
  secondaryRoll?: number;
  secondaryRolls?: number[];
  superUnlocked?: boolean;
  secondaryRollRevealing?: boolean;
  superUnlockRevealing?: boolean;
  superUnlockPlayerName?: string;
  superUnlockPlayerColor?: string;
  onRollSecondaryDice?: () => void;
  // Base game features
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
  secondaryRollPending = false,
  secondaryRoll,
  secondaryRolls = [],
  superUnlocked = false, // used for super announcement animation timing
  secondaryRollRevealing = false, // used for super announcement animation timing
  superUnlockRevealing = false,
  onRollSecondaryDice,
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
    useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (
      event.key.toLowerCase() === "r" &&
      secondaryRollPending &&
      onRollSecondaryDice
    ) {
      event.preventDefault();
      onRollSecondaryDice();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [secondaryRollPending, onRollSecondaryDice]);
  /*
   * Keep the secondary-roll overlay visible
   * while the result is being revealed.
   *
   * rollSecondaryDice() clears secondaryRollPending
   * immediately, so the presence of secondaryRoll
   * keeps the result visible until endTurn() clears it.
   */
  const showSecondaryRoll =
    !superUnlockRevealing &&
    (secondaryRollPending ||
      secondaryRoll !== undefined);
  return (
    <div
      style={{
        position: "relative",
        width: "800px",
        height: "600px",
      }}
    >
      <style>
        {`
    @keyframes secondaryRollPulse {
      0% {
        transform: scale(0.75);
        opacity: 0;
      }
      50% {
        transform: scale(1.15);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes superUnlockReveal {
      0% {
        transform: scale(0.72);
        opacity: 0;
      }
      60% {
        transform: scale(1.04);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `}
      </style>
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
      {/* PROSPERITY REGAL FRAME */}
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
              border:
                "1px solid rgba(231, 207, 143, 0.75)",
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
              border:
                "1px solid rgba(235, 214, 158, 0.65)",
            }}
          />
        </div>
      )}
      {/* PROSPERITY SECONDARY ROLL OVERLAY */}
      {showSecondaryRoll && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "18px",
            background:
              "rgba(8, 12, 20, 0.55)",
          }}
        >
          <div
            style={{
              minWidth: "240px",
              padding: "24px 30px",
              textAlign: "center",
              userSelect: "none",
              background:
                "linear-gradient(145deg, #3b2a0f, #8a6a25 50%, #3b2a0f)",
              border:
                "2px solid #C9A64A",
              borderRadius: "16px",
              boxShadow: `
          0 0 18px rgba(201, 166, 74, 0.35),
          inset 0 0 12px rgba(255, 215, 120, 0.12)
        `,
              color: "#F5E6B3",
            }}
          >
            {/* TITLE */}
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#D8BD72",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Era of Prosperity
            </div>
            {/* SECONDARY ROLL */}
            <div
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Secondary Roll
            </div>
            {/* INSTRUCTION */}
            <div
              style={{
                fontSize: "13px",
                color: "#D8BD72",
                marginBottom: "10px",
                fontWeight: "bold",
              }}
            >
              Roll All to Unlock Guild Super Ability!
            </div>
            {/* COLLECTED NUMBERS */}
            <div
              style={{
                width: "222px",
                height: "32px",
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "12px",
                marginLeft: "auto",
                marginRight: "auto",
                boxSizing: "content-box",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((number) => {
                const collected =
                  secondaryRolls?.includes(number) ?? false;
                return (
                  <div
                    key={number}
                    style={{
                      width: "32px",
                      height: "32px",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "7px",
                      border: collected
                        ? "2px solid #D4AF55"
                        : "1px solid #5B4A2A",
                      background: collected
                        ? "linear-gradient(180deg, #D4AF55, #9F7B2F)"
                        : "rgba(20, 20, 20, 0.45)",
                      color: collected
                        ? "#FFF8DF"
                        : "rgba(245, 230, 179, 0.35)",
                      fontSize: "14px",
                      fontWeight: "bold",
                      boxShadow: collected
                        ? "0 0 10px rgba(212, 175, 85, 0.35), inset 0 1px 2px rgba(255,255,255,0.25)"
                        : "inset 0 2px 4px rgba(0,0,0,0.4)",
                      transform: collected
                        ? "translateY(-1px)"
                        : "none",
                      transition:
                        "all 0.2s ease",
                    }}
                  >
                    {number}
                  </div>
                );
              })}
            </div>
            {/* RESULT / ROLL SLOT */}
            <div
              style={{
                height: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {secondaryRoll !== undefined ? (
                /* RESULT */
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "900",
                    lineHeight: 1,
                    color: "#F5E6B3",
                    textShadow: `
                0 0 6px rgba(255, 220, 130, 0.45),
                0 0 14px rgba(212, 175, 85, 0.35)
              `,
                    animation:
                      "secondaryRollPulse 0.7s ease-in-out",
                  }}
                >
                  {secondaryRoll}
                </div>
              ) : (
                /* ROLL BUTTON */
                <button
                  type="button"
                  onClick={onRollSecondaryDice}
                  style={{
                    padding: "12px 28px",
                    borderRadius: "10px",
                    border:
                      "2px solid #D4AF55",
                    background:
                      "linear-gradient(180deg, #D4AF55, #9F7B2F)",
                    color: "#FFF8DF",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow:
                      "0 0 10px rgba(212, 175, 85, 0.35)",
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  🎲 Roll Dice
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* SUPER UNLOCKED ANNOUNCEMENT */}
      {superUnlockRevealing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "18px",
            background:
              "rgba(8, 12, 20, 0.72)",
          }}
        >
          <div
            style={{
              width: "360px",
              padding: "34px 36px",
              textAlign: "center",
              userSelect: "none",
              background:
                "linear-gradient(145deg, #241805, #6F5424 35%, #B89545 50%, #6F5424 65%, #241805)",
              border:
                "3px solid #D4AF55",
              borderRadius: "20px",
              boxShadow: `
              0 0 20px rgba(212, 175, 85, 0.55),
              0 0 45px rgba(212, 175, 85, 0.28),
              inset 0 0 18px rgba(255, 220, 130, 0.16),
              inset 0 0 0 1px rgba(255, 239, 190, 0.5)
          `,
              color: "#FFF8DF",
              animation:
                "superUnlockReveal 0.7s ease-out",
            }}
          >
            {/* TOP ORNAMENT */}
            <div
              style={{
                fontSize: "20px",
                color: "#F5E6B3",
                letterSpacing: "8px",
                marginBottom: "14px",
              }}
            >
              ✦ ✦ ✦
            </div>
            {/* ERA */}
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#D8BD72",
                marginBottom: "14px",
                fontWeight: "bold",
              }}
            >
              Era of Prosperity
            </div>
            {/* MAIN TITLE */}
            <div
              style={{
                fontSize: "30px",
                fontWeight: "900",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#FFF8DF",
                textShadow: `
                0 0 8px rgba(255, 225, 145, 0.65),
                0 0 18px rgba(212, 175, 85, 0.45)
            `,
                marginBottom: "14px",
              }}
            >
              Super Unlocked
            </div>
            {/* MESSAGE */}
            <div
              style={{
                fontSize: "16px",
                lineHeight: 1.5,
                color: "#FFF4D0",
                padding: "0 4px",
              }}
            >
              Available on your next turn!
            </div>
            {/* BOTTOM ORNAMENT */}
            <div
              style={{
                marginTop: "14px",
                fontSize: "20px",
                color: "#F5E6B3",
                letterSpacing: "8px",
              }}
            >
              ✦ ✦ ✦
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BoardView;