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
  playerColor?: string;
  // Winner
  winnerName?: string;
  guildName?: string;
  winnerRevealing?: boolean;
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
  playerColor,
  // Winner
  winnerName,
  guildName,
  winnerRevealing = false,
}: BoardViewProps) {
  void superUnlocked;
  void secondaryRollRevealing;
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
                inset 0 0 0 1px rgba(212, 183, 102, 0.4)
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
                "2px solid rgba(235, 214, 158, 0.65)",
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
                background: "rgba(0, 0, 0, 0.12)",
                borderRadius: "99px",
                padding: "6px 12px",
                display: "inline-block",
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
              Roll All to Unlock Guild Super Ability
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
              "rgba(8, 12, 20, 0.55)",
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
                background: "rgba(0, 0, 0, 0.12)",
                borderRadius: "99px",
                padding: "6px 12px",
                display: "inline-block",
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
              Available on your next turn.
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
      {/* ========================================================= */}
      {/* VICTORY ANNOUNCEMENT                                      */}
      {/* ========================================================= */}
      {winnerRevealing && winnerName && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "18px",
            background:
              "rgba(8, 12, 20, 0.55)",
          }}
        >
          <style>
            {`
            /* ===================================================== */
            /* VICTORY ANIMATIONS                                    */
            /* ===================================================== */
            @keyframes victoryConfetti {
              0% {
                transform: translate(0, -30px) rotate(0deg);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              50% {
                opacity: 1;
              }
              100% {
                transform: translate(
                  var(--drift-x),
                  650px
                ) rotate(var(--rotate));
                opacity: 0;
              }
            }
            /* ===================================================== */
            /* GOLD DUST SPARK                                      */
            /* ===================================================== */
            @keyframes victoryGoldSpark {
              0% {
                transform: translate(0, 0) scale(0);
                opacity: 0;
              }
              15% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              45% {
                transform: translate(
                  var(--spark-x),
                  var(--spark-y)
                ) scale(1.15);
                opacity: 0.9;
              }
              75% {
                transform: translate(
                  calc(var(--spark-x) * 1.15),
                  calc(var(--spark-y) * 1.15)
                ) scale(0.7);
                opacity: 0.45;
              }
              100% {
                transform: translate(
                  calc(var(--spark-x) * 1.3),
                  calc(var(--spark-y) * 1.3)
                ) scale(0);
                opacity: 0;
              }
            }
            /* ===================================================== */
            /* FOUR-POINT GOLD SPARKLE                              */
            /* ===================================================== */
            @keyframes victoryGoldStar {
              0% {
                transform: translate(0, 0) scale(0);
                opacity: 0;
              }
              15% {
                transform: translate(0, 0) scale(0.35);
                opacity: 0;
              }
              35% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              60% {
                transform: translate(
                  var(--star-x),
                  var(--star-y)
                ) scale(1.15);
                opacity: 0.85;
              }
              100% {
                transform: translate(
                  calc(var(--star-x) * 1.2),
                  calc(var(--star-y) * 1.2)
                ) scale(0);
                opacity: 0;
              }
            }
            /* ===================================================== */
            /* FIREWORK BURST                                       */
            /* ===================================================== */
            @keyframes victoryBurst {
              0% {
                transform: translate(0, 0) scale(0);
                opacity: 0;
              }
              12% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              55% {
                transform: translate(
                  var(--burst-x),
                  var(--burst-y)
                ) scale(1);
                opacity: 0.9;
              }
              100% {
                transform: translate(
                  calc(var(--burst-x) * 1.35),
                  calc(var(--burst-y) * 1.35)
                ) scale(0);
                opacity: 0;
              }
            }
            /* ===================================================== */
            /* CELEBRATION CONTAINER                                 */
            /* ===================================================== */
            .victory-celebration {
              position: absolute;
              inset: 0;
              pointer-events: none;
              overflow: hidden;
              z-index: 1;
            }
            /* ===================================================== */
            /* CONFETTI                                              */
            /* ===================================================== */
            .victory-confetti {
              position: absolute;
              top: -20px;
              width: var(--size);
              height: var(--height);
              left: var(--x);
              background: var(--color);
              border-radius: 2px;
              box-shadow: 0 0 2px rgba(255, 255, 255, 0.18);
              animation:
                victoryConfetti
                var(--duration)
                var(--delay)
                linear
                infinite;
            }
            /* ===================================================== */
            /* FIREWORK BURST PARTICLES                              */
            /* ===================================================== */
            .victory-burst {
              position: absolute;
              width: 4px;
              height: 4px;
              border-radius: 50%;
              background: var(--burst-color);
              box-shadow: 0 0 4px var(--burst-color);
              animation:
                victoryBurst
                var(--burst-duration)
                var(--burst-delay)
                ease-out
                infinite;
            }
          `}
          </style>
          {/* ========================================================= */}
          {/* CELEBRATION BACKGROUND                                    */}
          {/* ========================================================= */}
          <div className="victory-celebration">
            {/* ======================================================= */}
            {/* CONFETTI                                                */}
            {/* ======================================================= */}
            {[
              [4, 6, 15, "#D4AF55", "3.8s", "0s"],
              [9, 4, 11, "#FFF4D0", "4.6s", "-2s"],
              [14, 7, 17, "#F1D77A", "3.4s", "-1s"],
              [20, 5, 13, "#FFF8DF", "5.1s", "-3s"],
              [27, 6, 16, "#D4AF55", "4.2s", "-1.8s"],
              [34, 4, 12, "#F5E6B3", "3.7s", "-2.5s"],
              [42, 7, 18, "#D4AF55", "4.9s", "-4s"],
              [49, 5, 13, "#FFF0B0", "3.5s", "-1.2s"],
              [57, 6, 16, "#F1D77A", "4.4s", "-3.4s"],
              [65, 4, 12, "#FFF8DF", "5.2s", "-2.1s"],
              [73, 7, 17, "#D4AF55", "3.9s", "-4.5s"],
              [81, 5, 14, "#F5E6B3", "4.7s", "-1.6s"],
              [89, 6, 16, "#F1D77A", "3.6s", "-3s"],
              [96, 4, 11, "#FFF4D0", "5s", "-2.8s"],
              [3, 5, 13, "#F1D77A", "4.5s", "-2.3s"],
              [11, 7, 16, "#D4AF55", "3.9s", "-1.1s"],
              [18, 4, 12, "#FFF8DF", "5.2s", "-4s"],
              [26, 6, 15, "#F5E6B3", "4.1s", "-2.7s"],
              [35, 5, 13, "#D4AF55", "3.7s", "-1.9s"],
              [44, 7, 17, "#F1D77A", "4.8s", "-3.5s"],
              [53, 4, 12, "#FFF4D0", "3.5s", "-1.4s"],
              [61, 6, 15, "#D4AF55", "4.4s", "-2.6s"],
              [70, 5, 14, "#FFF8DF", "5s", "-4.2s"],
              [78, 7, 17, "#F5E6B3", "3.8s", "-2s"],
              [87, 4, 12, "#F1D77A", "4.6s", "-3.1s"],
              [95, 6, 16, "#D4AF55", "4s", "-1.7s"],
            ].map(
              ([x, size, height, color, duration, delay], index) => {
                const randomDrift = Math.random() * 160 - 80;
                const randomRotation = Math.random() * 720 - 360;
                return (
                  <div
                    key={`victory-confetti-${index}`}
                    className="victory-confetti"
                    style={
                      {
                        "--x": `${x}%`,
                        "--size": `${size}px`,
                        "--height": `${height}px`,
                        "--color": color,
                        "--duration": duration,
                        "--delay": delay,
                        "--drift-x": `${randomDrift}px`,
                        "--rotate": `${randomRotation}deg`,
                      } as React.CSSProperties
                    }
                    onAnimationIteration={(e) => {
                      const element = e.currentTarget;
                      element.style.setProperty(
                        "--x",
                        `${Math.random() * 100}%`
                      );
                      element.style.setProperty(
                        "--drift-x",
                        `${Math.random() * 160 - 80}px`
                      );
                      element.style.setProperty(
                        "--rotate",
                        `${Math.random() * 720 - 360}deg`
                      );
                    }}
                  />
                );
              }
            )}
            {/* ======================================================= */}
            {/* > GOLD DUST / SPARKS                                   */}
            {/* ======================================================= */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
              }}
            >
              {/* ===================================================== */}
              {/* >> GOLD DUST                                          */}
              {/* ===================================================== */}
              {[
                [5, 14, 4, 2.4, 0.1, -18, 24],
                [12, 31, 3, 3.7, 1.4, 24, -18],
                [18, 11, 5, 4.2, 2.1, -28, 20],
                [24, 44, 3, 2.9, 0.7, 20, 28],
                [31, 18, 4, 3.8, 2.8, -22, -25],
                [38, 8, 3, 4.6, 1.2, 30, 18],
                [44, 35, 5, 3.2, 3.1, -26, 30],
                [51, 13, 3, 4.1, 0.4, 18, -22],
                [58, 42, 4, 3.5, 2.3, 28, 20],
                [64, 20, 3, 4.8, 1.7, -24, -28],
                [71, 9, 5, 3.1, 3.6, 26, 24],
                [77, 34, 3, 4.4, 0.9, -30, 18],
                [84, 16, 4, 3.6, 2.6, 22, -24],
                [91, 29, 3, 4.9, 1.5, -20, 30],
                [96, 11, 5, 3.3, 3.9, 28, -18],
                [7, 63, 3, 4.3, 2.2, -26, -20],
                [14, 82, 5, 3.4, 0.6, -26, -20],
                [21, 57, 3, 4.7, 3.4, 30, 24],
                [28, 91, 4, 3.1, 1.1, -18, -30],
                [35, 69, 3, 4.5, 2.7, 25, 22],
                [42, 84, 5, 3.8, 0.3, -28, 18],
                [49, 61, 3, 4.2, 1.9, 20, -26],
                [56, 93, 4, 3.6, 3.2, 28, -20],
                [63, 73, 3, 4.9, 0.8, -24, 28],
                [70, 88, 5, 3.3, 2.5, 18, -24],
                [78, 64, 3, 4.1, 1.6, -30, 20],
                [85, 81, 4, 3.7, 3.7, 24, 26],
                [93, 69, 3, 4.6, 0.5, -20, -28],
                [98, 91, 5, 3.2, 2.9, 30, 18],
                [8, 42, 3, 5.1, 1.3, -26, 20],
                [16, 49, 4, 3.5, 3.5, 24, -28],
                [26, 32, 3, 4.4, 2.0, -20, 26],
                [33, 52, 5, 3.9, 0.2, 28, -18],
                [67, 48, 3, 4.7, 2.8, -30, 22],
                [74, 55, 4, 3.3, 1.0, 20, -24],
                [88, 45, 5, 4.0, 3.3, -24, 28],
              ].map(
                (
                  [x, y, size, duration, delay, sparkX, sparkY],
                  index
                ) => (
                  <div
                    key={`gold-spark-${index}`}
                    onAnimationIteration={(e) => {
                      const element = e.currentTarget;
                      element.style.left = `${Math.random() * 100}%`;
                      element.style.top = `${Math.random() * 100}%`;
                      element.style.setProperty(
                        "--spark-x",
                        `${Math.random() * 60 - 30}px`
                      );
                      element.style.setProperty(
                        "--spark-y",
                        `${Math.random() * 60 - 30}px`
                      );
                    }}
                    style={
                      {
                        position: "absolute",
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: "50%",
                        background:
                          index % 5 === 0
                            ? "#FFF8DF"
                            : index % 3 === 0
                              ? "#F1D77A"
                              : "#D4AF55",
                        boxShadow:
                          "0 0 5px #F1D77A, 0 0 12px rgba(212,175,85,0.75)",
                        animation:
                          `victoryGoldSpark ${duration}s ${delay}s ease-out infinite`,
                        "--spark-x": `${sparkX}px`,
                        "--spark-y": `${sparkY}px`,
                      } as React.CSSProperties
                    }
                  />
                )
              )}
              {/* ===================================================== */}
              {/* >> LARGER FOUR-POINT SPARKLES                        */}
              {/* ===================================================== */}
              {[
                [9, 24, 2.8, 0.2, -24, 18],
                [22, 72, 3.7, 1.6, 20, -26],
                [37, 27, 3.2, 2.4, -18, 24],
                [63, 31, 4.1, 0.8, 28, 20],
                [79, 76, 3.4, 2.9, -25, -20],
                [94, 57, 3.9, 1.3, -20, 26],
              ].map(
                (
                  [x, y, duration, delay, starX, starY],
                  index
                ) => (
                  <div
                    key={`gold-star-${index}`}
                    onAnimationIteration={(e) => {
                      const element = e.currentTarget;
                      element.style.left = `${Math.random() * 100}%`;
                      element.style.top = `${Math.random() * 100}%`;
                      element.style.setProperty(
                        "--star-x",
                        `${Math.random() * 60 - 30}px`
                      );
                      element.style.setProperty(
                        "--star-y",
                        `${Math.random() * 60 - 30}px`
                      );
                    }}
                    style={
                      {
                        position: "absolute",
                        left: `${x}%`,
                        top: `${y}%`,
                        width: "18px",
                        height: "18px",
                        "--star-x": `${starX}px`,
                        "--star-y": `${starY}px`,
                        animation:
                          `victoryGoldStar ${duration}s ${delay}s ease-out infinite`,
                      } as React.CSSProperties
                    }
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "3px",
                        height: "18px",
                        transform: "translate(-50%, -50%)",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(to bottom, transparent, #FFF8DF, transparent)",
                        boxShadow: "0 0 8px #F1D77A",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: "18px",
                        height: "3px",
                        transform: "translate(-50%, -50%)",
                        borderRadius: "50%",
                        background:
                          "linear-gradient(to right, transparent, #FFF8DF, transparent)",
                        boxShadow: "0 0 8px #F1D77A",
                      }}
                    />
                  </div>
                )
              )}
              {/* ===================================================== */}
              {/* >> FIREWORK BURSTS                                    */}
              {/* ===================================================== */}
              {[
                [8, 22, "#FFF4D0", "1.8s", "0s"],
                [18, 54, "#D4AF55", "3.7s", "1.2s"],
                [29, 17, "#F1D77A", "2.4s", "0.5s"],
                [41, 43, "#FFF8DF", "4.6s", "2.1s"],
                [53, 25, "#D4AF55", "3.1s", "0.8s"],
                [64, 61, "#F1D77A", "5.0s", "1.7s"],
                [75, 19, "#FFF4D0", "2.0s", "0.3s"],
                [84, 47, "#D4AF55", "4.2s", "2.5s"],
                [92, 29, "#F1D77A", "3.4s", "1.0s"],
                [97, 72, "#FFF8DF", "5.4s", "2.8s"],
              ].map(
                ([x, y, color, duration, delay], burstIndex) => (
                  <div
                    key={`firework-burst-${burstIndex}`}
                    onAnimationIteration={(e) => {
                      const element = e.currentTarget;
                      let x = Math.random() * 100;
                      let y = Math.random() * 100;
                      // =========================================================
                      // CENTER NO-BURST ZONE
                      // =========================================================
                      while (
                        x >= 26 &&
                        x <= 74 &&
                        y >= 22 &&
                        y <= 78
                      ) {
                        x = Math.random() * 100;
                        y = Math.random() * 100;
                      }
                      element.style.left = `${x}%`;
                      element.style.top = `${y}%`;
                    }}
                    style={{
                      position: "absolute",
                      left: `${x}%`,
                      top: `${y}%`,
                      width: "0px",
                      height: "0px",
                    }}
                  >
                    {Array.from({ length: 12 }).map(
                      (_, particleIndex) => {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 35 + Math.random() * 40;
                        return (
                          <div
                            key={`burst-particle-${burstIndex}-${particleIndex}`}
                            className="victory-burst"
                            style={
                              {
                                "--burst-color": color,
                                "--burst-duration": duration,
                                "--burst-delay": delay,
                                "--burst-x": `${Math.cos(angle) * distance
                                  }px`,
                                "--burst-y": `${Math.sin(angle) * distance
                                  }px`,
                              } as React.CSSProperties
                            }
                          />
                        );
                      }
                    )}
                  </div>
                )
              )}
            </div>
          </div>
          {/* ========================================================= */}
          {/* VICTORY MODAL                                             */}
          {/* ========================================================= */}
          <div
            style={{
              position: "relative",
              zIndex: 50,
              width: "420px",
              padding: "40px",
              textAlign: "center",
              userSelect: "none",
              background:
                "linear-gradient(145deg, #241805, #6F5424 35%, #B89545 50%, #6F5424 65%, #241805)",
              border: "3px solid #D4AF55",
              borderRadius: "20px",
              boxShadow: `
          0 0 20px rgba(212, 175, 85, 0.60),
          0 0 45px rgba(212, 175, 85, 0.30),
          0 0 80px rgba(212, 175, 85, 0.16),
          inset 0 0 18px rgba(255, 220, 130, 0.16),
          inset 0 0 0 1px rgba(255, 239, 190, 0.5)
        `,
              color: "#FFF8DF",
            }}
          >
            {/* ===================================================== */}
            {/* TOP ORNAMENT                                          */}
            {/* ===================================================== */}
            <div
              style={{
                fontSize: "22px",
                color: "#F5E6B3",
                letterSpacing: "10px",
                marginBottom: "22px",
              }}
            >
              ✦ ✦ ✦
            </div>
            {/* ===================================================== */}
            {/* ERA                                                   */}
            {/* ===================================================== */}
            <div
              style={{
                fontSize: "13px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#D8BD72",
                margin: "0px",
                fontWeight: "bold",
                background: "rgba(0, 0, 0, 0.12)",
                borderRadius: "99px",
                padding: "6px 14px",
                display: "inline-block",
              }}
            >
              Era of Prosperity
            </div>
            {/* ===================================================== */}
            {/* MAIN TITLE                                             */}
            {/* ===================================================== */}
            <div
              style={{
                fontSize: "34px",
                fontWeight: "900",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#FFF8DF",
                margin: "0px 0px 8px",
              }}
            >
              Victory
            </div>
            {/* ===================================================== */}
            {/* DIVIDER                                            */}
            {/* ===================================================== */}
            <hr
              style={{
                width: "72%",
                height: "1px",
                margin: "12px auto",
                border: "none",
                borderRadius: "999px",
                background:
                  "linear-gradient(to right, transparent, #D4AF55 20%, #FFF4D0 50%, #D4AF55 80%, transparent)",
                boxShadow: "0 0 8px rgba(212, 175, 85, 0.45)",
                opacity: 0.8,
              }}
            />
            {/* ===================================================== */}
            {/* GUILD NAME                                            */}
            {/* ===================================================== */}
            {guildName && (
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "800",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#D8BD72",
                  margin: "12px 0px",
                }}
              >
                {guildName} GUILD
              </div>
            )}
            {/* ===================================================== */}
            {/* WINNER NAME                                           */}
            {/* ===================================================== */}
            <div
              style={{
                fontSize: "42px",
                fontWeight: "900",
                letterSpacing: "2px",
                color: "#FFF4D0",
                margin: "0px",
                background: "rgba(0, 0, 0, 0.22)",
                border: `5px solid ${playerColor}`,
                borderRadius: "999px",
                padding: "13px 37px",
                display: "inline-block",
                opacity: 0.9,
              }}
            >
              {winnerName}
            </div>
            {/* ===================================================== */}
            {/* MESSAGE                                               */}
            {/* ===================================================== */}
            <div
              style={{
                fontSize: "14px",
                color: "#D8BD72",
                letterSpacing: "1px",
                margin: "12px 0px 0px"
              }}
            >
              has won the game!
            </div>
            {/* ===================================================== */}
            {/* BOTTOM ORNAMENT                                       */}
            {/* ===================================================== */}
            <div
              style={{
                marginTop: "22px",
                fontSize: "22px",
                color: "#F5E6B3",
                letterSpacing: "10px",
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