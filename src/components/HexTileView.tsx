import type { HexTile } from "../game/domain/HexTile";
import NumberToken from "./NumberToken";
interface HexTileViewProps {
    tile: HexTile;
    robberPending?: boolean;
    robberTileId?: string;
    onSelectTile?: (tileId: string) => void;
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
const RESOURCE_COLORS = {
    brick: "#b45309",
    lumber: "#166534",
    wheat: "#eab308",
    sheep: "#65a30d",
    ore: "#6b7280",
    desert: "#d6c28a",
};
export default function HexTileView({
    tile,
    robberPending = false,
    robberTileId,
    onSelectTile,
}: HexTileViewProps) {
    const isRobberTile = robberTileId === tile.id;
    // const isValidRobberTarget = robberPending && !isRobberTile;
    return (
        <g
            onClick={() => {
                if (robberPending && !isRobberTile) {
                    onSelectTile?.(tile.id);
                }
            }}
            style={{
                cursor:
                    robberPending && !isRobberTile
                        ? "pointer"
                        : "default",
            }}
        >
            {/* HEX */}
            <polygon
                points={hexPoints(tile.x, tile.y)}
                fill={RESOURCE_COLORS[tile.resource]}
                filter={
                    isRobberTile
                        ? "drop-shadow(0 0 31px rgba(0, 0, 0, 1))"
                        : undefined
                }
            />
            {isRobberTile && (
                <polygon
                    points={hexPoints(tile.x, tile.y)}
                    fill="#000000"
                    fillOpacity={0.75}
                    pointerEvents="none"
                />
            )}
            {/* NUMBER TOKEN */}
            {tile.numberToken && (
                <NumberToken
                    x={tile.x}
                    y={tile.y}
                    value={tile.numberToken}
                />
            )}
            {/* RESOURCE LABEL */}
            <text
                x={tile.x}
                y={tile.y + 38}
                textAnchor="middle"
                fontSize="12"
                fill="black"
                fontWeight="normal"
            >
                {tile.resource}
            </text>
            {/* ROBBER — JACK-O-LANTERN ICON */}
            {isRobberTile && (
                <g>
                    {/* Purple circle behind pumpkin */}
                    <circle
                        cx={tile.x}
                        cy={tile.y}
                        r="25"
                        fill="#7c3aed"
                        stroke="#000000"
                        strokeWidth="2"
                    />
                    <g transform="translate(0 1)">
                        {/* Black pumpkin body — slightly elongated horizontally */}
                        <path
                            d={`
                                M ${tile.x} ${tile.y - 14}
                                C ${tile.x - 5} ${tile.y - 20},
                                ${tile.x - 14} ${tile.y - 14},
                                ${tile.x - 18} ${tile.y - 11}
                                C ${tile.x - 24} ${tile.y - 4},
                                ${tile.x - 22} ${tile.y + 7},
                                ${tile.x - 14} ${tile.y + 14}
                                C ${tile.x - 9} ${tile.y + 18},
                                ${tile.x - 3} ${tile.y + 19},
                                ${tile.x} ${tile.y + 17}
                                C ${tile.x + 3} ${tile.y + 19},
                                ${tile.x + 9} ${tile.y + 18},
                                ${tile.x + 14} ${tile.y + 14}
                                C ${tile.x + 22} ${tile.y + 7},
                                ${tile.x + 24} ${tile.y - 4},
                                ${tile.x + 18} ${tile.y - 11}
                                C ${tile.x + 14} ${tile.y - 14},
                                ${tile.x + 5} ${tile.y - 20},
                                ${tile.x} ${tile.y - 14}
                                Z
                            `}
                            fill="#000000"
                        />
                        {/* Subtle pumpkin center indentation */}
                        <path
                            d={`
                                M ${tile.x} ${tile.y - 17}
                                C ${tile.x - 2} ${tile.y - 8},
                                ${tile.x - 2} ${tile.y + 9},
                                ${tile.x} ${tile.y + 18}
                            `}
                            fill="none"
                            stroke="#111111"
                            strokeWidth="2"
                        />
                        {/* Sharp pointed stem */}
                        <path
                            d={`
                                M ${tile.x - 3} ${tile.y - 15}
                                L ${tile.x - 1} ${tile.y - 22}
                                L ${tile.x + 3} ${tile.y - 20}
                                L ${tile.x + 3} ${tile.y - 15}
                                Z
                            `}
                            fill="#000000"
                        />
                        {/* Orange triangle eyes */}
                        <polygon
                            points={`
                            ${tile.x - 10},${tile.y - 6}
                            ${tile.x - 3},${tile.y - 2}
                            ${tile.x - 11},${tile.y + 0}
                        `}
                            fill="#f97316"
                        />
                        {/* Small orange triangle nose */}
                        <polygon
                            points={`
                                ${tile.x},${tile.y - 1}
                                ${tile.x - 3},${tile.y + 3}
                                ${tile.x + 3},${tile.y + 3}
                            `}
                            fill="#f97316"
                        />
                        <polygon
                            points={`
                                ${tile.x + 3},${tile.y - 2}
                                ${tile.x + 10},${tile.y - 6}
                                ${tile.x + 11},${tile.y + 0}
                            `}
                            fill="#f97316"
                        />
                        {/* Slightly closed jack-o-lantern smile */}
                        <path
                            d={`
                            M ${tile.x - 13} ${tile.y + 4}
                            Q ${tile.x} ${tile.y + 10}
                            ${tile.x + 13} ${tile.y + 4}
                            L ${tile.x + 10} ${tile.y + 11}
                            Q ${tile.x + 6} ${tile.y + 12}
                            ${tile.x} ${tile.y + 12}
                            Q ${tile.x - 6} ${tile.y + 12}
                            ${tile.x - 10} ${tile.y + 11}
                            Z
                        `}
                            fill="#f97316"
                        />
                        {/* Square-ish black tooth cuts */}
                        <rect
                            x={tile.x - 8}
                            y={tile.y + 6}
                            width="4"
                            height="4"
                            rx="0.5"
                            fill="#000000"
                        />
                        <rect
                            x={tile.x + 4}
                            y={tile.y + 6}
                            width="4"
                            height="4"
                            rx="0.5"
                            fill="#000000"
                        />
                        <rect
                            x={tile.x - 2}
                            y={tile.y + 9}
                            width="4"
                            height="5"
                            rx="0.5"
                            fill="#000000"
                        />
                    </g>
                </g>
            )}
            {/* ROBBER SELECTION INDICATOR */}
            {robberPending && !isRobberTile && (
                <g>
                    <circle
                        cx={tile.x}
                        cy={tile.y - 38}
                        r="11"
                        fill="#ef4444"
                        stroke="#111827"
                        strokeWidth="2"
                        pointerEvents="none"
                    />
                    <text
                        x={tile.x}
                        y={tile.y - 33}
                        textAnchor="middle"
                        fontSize="14"
                        fill="#111827"
                        fontWeight="bold"
                        pointerEvents="none"
                    >
                        ?
                    </text>
                </g>
            )}
        </g>
    );
}