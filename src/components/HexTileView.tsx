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
    console.log("@@@[ROBBER UI]@@@", {
        tileId: tile.id,
        robberPending,
        robberTileId,
        isRobberTile: robberTileId === tile.id,
    });
    const isRobberTile = robberTileId === tile.id;
    return (
        <g
            onClick={() => {
                if (robberPending) {
                    onSelectTile?.(tile.id);
                }
            }}
            style={{
                cursor: robberPending
                    ? "pointer"
                    : "default",
            }}
        >
            {/* HEX */}
            <polygon
                points={hexPoints(tile.x, tile.y)}
                fill={RESOURCE_COLORS[tile.resource]}
                stroke={
                    isRobberTile
                        ? "#ef4444"
                        : "#111827"
                }
                strokeWidth={
                    isRobberTile
                        ? 6
                        : 2
                }
            />
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
            {/* ROBBER */}
            {isRobberTile && (
                <g pointerEvents="none">
                    <circle
                        cx={tile.x}
                        cy={tile.y}
                        r="18"
                        fill="#111827"
                        stroke="#ffffff"
                        strokeWidth="3"
                    />

                    <circle
                        cx={tile.x}
                        cy={tile.y - 8}
                        r="6"
                        fill="#ffffff"
                    />

                    <path
                        d={`
                M ${tile.x - 9} ${tile.y + 12}
                Q ${tile.x} ${tile.y + 2}
                  ${tile.x + 9} ${tile.y + 12}
                Z
            `}
                        fill="#ffffff"
                    />
                </g>
            )}

            {/* ROBBER SELECTION INDICATOR */}
            {robberPending && !isRobberTile && (
                <text
                    x={tile.x}
                    y={tile.y - 38}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#111827"
                    fontWeight="bold"
                >
                    ?
                </text>
            )}
        </g>
    );
}