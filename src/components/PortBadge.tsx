import { useState } from "react";
import type { Port } from "../game/domain/Port";
interface PortBadgeProps {
    x: number;
    y: number;
    type: Port["type"];
    ratio: number;
}
const RESOURCE_COLORS = {
    generic: "#94a3b8",
    brick: "#b45309",
    lumber: "#166534",
    wheat: "#eab308",
    sheep: "#65a30d",
    ore: "#6b7280",
};
const RESOURCE_LABELS = {
    generic: "any",
    brick: "brick",
    lumber: "lumber",
    wheat: "wheat",
    sheep: "sheep",
    ore: "ore",
};
export default function PortBadge({
    x,
    y,
    type,
    ratio,
}: PortBadgeProps) {
    const [hovered, setHovered] = useState(false);
    return (
        <g
            pointerEvents="auto"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ cursor: "default" }}
        >
            <g
                style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    transform: hovered
                        ? "scale(1.75)"
                        : "scale(1)",
                    transition:
                        "transform 0.15s ease",
                }}
            >
                {/* white badge background */}
                <rect
                    x={x - 20}
                    y={y - 34}
                    width="40"
                    height="56"
                    rx="8"
                    fill="#d3d3d3"
                    stroke="#111827"
                    strokeWidth="2"
                />
                {/* resource square */}
                <rect
                    x={x - 8}
                    y={y - 25}
                    width="16"
                    height="16"
                    rx="4"
                    fill={RESOURCE_COLORS[type]}
                    stroke="#111827"
                    strokeWidth="1.5"
                />
                {/* generic symbol */}
                {type === "generic" && (
                    <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="900"
                        fill="#111827"
                    >
                        ?
                    </text>
                )}
                {/* resource name */}
                <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="#111827"
                >
                    {RESOURCE_LABELS[type]}
                </text>
                {/* trade ratio */}
                <text
                    x={x}
                    y={y + 13}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="900"
                    fill="#111827"
                >
                    {ratio}:1
                </text>
            </g>
        </g>
    );
}