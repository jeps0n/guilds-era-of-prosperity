interface NumberTokenProps {
  x: number;
  y: number;
  value: number;
}
export default function NumberToken({
  x,
  y,
  value,
}: NumberTokenProps) {
  return (
    <g pointerEvents="none">
      <rect
        x={x - 18}
        y={y - 18}
        width="36"
        height="36"
        rx="15"
        fill="#f9fafb"
        stroke="#c0c0c0"
        strokeWidth="2"
      />
      <text
        x={x}
        y={y + 6}
        textAnchor="middle"
        fontWeight="bold"
        fontSize="18"
      >
        {value}
      </text>
    </g>
  );
}