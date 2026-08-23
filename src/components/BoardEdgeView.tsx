import type { BoardEdge } from "../game/domain/BoardEdge";
import type { BoardNode } from "../game/domain/BoardNode";
import type { Port } from "../game/domain/Port";
interface RoadData {
    id: string;
    edgeId: string;
    playerId: string;
}
interface BoardEdgeViewProps {
    edge: BoardEdge;
    nodeA?: BoardNode;
    nodeB?: BoardNode;
    road?: RoadData;
    port?: Port;
    hovered: boolean;
    onHover: (edgeId: string | null) => void;
    onSelectEdge?: (edgeId: string) => void;
}
export default function BoardEdgeView({
    edge,
    nodeA,
    nodeB,
    road,
    port,
    hovered,
    onHover,
    onSelectEdge,
}: BoardEdgeViewProps) {
    if (!nodeA || !nodeB) {
        return null;
    }
    return (
        <>
            {/* PORT DOCK */}
            {port && (
                <path
                    d={portArcPath(
                        nodeA.x,
                        nodeA.y,
                        nodeB.x,
                        nodeB.y
                    )}
                    fill="#A28744"
                    stroke="#A28744"
                    strokeWidth="10"
                    strokeLinecap="round"
                    pointerEvents="none"
                />
            )}
            {/* ROAD */}
            {road ? (
                <>
                    {/* BLACK ROAD BORDER */}
                    <line
                        x1={nodeA.x}
                        y1={nodeA.y}
                        x2={nodeB.x}
                        y2={nodeB.y}
                        stroke="#000"
                        strokeWidth="15"
                        strokeLinecap="round"
                        pointerEvents="none"
                        style={{
                            filter: hovered
                                ? "drop-shadow(0 0 6px #ef4444)"
                                : "none",
                        }}
                    />
                    {/* PLAYER ROAD COLOR */}
                    <line
                        x1={nodeA.x}
                        y1={nodeA.y}
                        x2={nodeB.x}
                        y2={nodeB.y}
                        stroke={
                            hovered
                                ? "#ef4444"
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
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke={hovered ? "#ef4444" : "#78350f"}
                    strokeWidth={hovered ? 10 : 6}
                    strokeLinecap="round"
                    pointerEvents="none"
                    style={{
                        filter: hovered
                            ? "drop-shadow(0 0 6px #ef4444)"
                            : "none",
                    }}
                />
            )}
            {/* CLICK / HOVER HITBOX */}
            <line
                x1={nodeA.x}
                y1={nodeA.y}
                x2={nodeB.x}
                y2={nodeB.y}
                stroke="transparent"
                strokeWidth="22"
                pointerEvents="stroke"
                onMouseEnter={() => onHover(edge.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelectEdge?.(edge.id)}
                style={{
                    cursor: onSelectEdge ? "pointer" : "default",
                }}
            />
        </>
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
    const length = Math.sqrt(dx * dx + dy * dy);
    const radius = length / 2;
    return `
        M ${ax} ${ay}
        A ${radius} ${radius} 0 0 1 ${bx} ${by}
    `;
}