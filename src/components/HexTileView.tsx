import type { HexTile } from "../game/domain/HexTile";
import NumberToken from "./NumberToken";
interface HexTileViewProps {
    tile: HexTile;
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
}: HexTileViewProps) {
    return (
        <g>
            {/* HEX */}
            <polygon
                points={hexPoints(tile.x, tile.y)}
                fill={RESOURCE_COLORS[tile.resource]}
                stroke="#111827"
                strokeWidth="2"
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
        </g>
    );
}