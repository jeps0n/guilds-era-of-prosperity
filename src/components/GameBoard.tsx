import type { GameState } from "../game/engine/GameState";


interface GameBoardProps {
  game: GameState;
  onSelectLocation: (location: string) => void;
}


const SIZE = 75;


function hexPoints(
  x: number,
  y: number
) {
  return Array.from(
    { length: 6 },
    (_, i) => {

const angle =
  Math.PI / 180 * (i * 60);

      return [
        x + SIZE * Math.cos(angle),
        y + SIZE * Math.sin(angle),
      ].join(",");

    }
  ).join(" ");
}


function GameBoard({
  game,
  onSelectLocation,
}: GameBoardProps) {

  const occupiedNodes =
    game.players.flatMap((player) =>
      player.settlements.map(
        (settlement) => settlement.nodeId
      )
    );


  return (
    <svg
      width="900"
      height="700"
      viewBox="-400 -350 800 700"
      style={{
        background: "#87ceeb",
      }}
    >

      {game.board.tiles.map((tile) => (

        <g key={tile.id}>

          <polygon
            points={
              hexPoints(
                tile.x,
                tile.y
              )
            }
            fill={
              {
                brick: "#b45309",
                lumber: "#166534",
                wheat: "#eab308",
                sheep: "#65a30d",
                ore: "#6b7280",
                desert: "#d6c28a",
              }[tile.resource]
            }
            stroke="black"
            strokeWidth="2"
          />

          {tile.numberToken && (
            <text
              x={tile.x}
              y={tile.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
              fill="black"
            >
              {tile.numberToken}
            </text>
          )}

        </g>

      ))}


      {game.board.edges.map((edge) => {

        const a =
          game.board.nodes.find(
            (node) =>
              node.id === edge.nodeA
          );

        const b =
          game.board.nodes.find(
            (node) =>
              node.id === edge.nodeB
          );


        if (!a || !b) return null;


        return (
          <line
            key={edge.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#78350f"
            strokeWidth="8"
          />
        );

      })}


      {game.board.nodes.map((node) => {

        const occupied =
          occupiedNodes.includes(node.id);


        return (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="10"
            fill={
              occupied
                ? "#ef4444"
                : "#2563eb"
            }
            stroke="white"
            strokeWidth="2"
            onClick={() =>
              onSelectLocation(node.id)
            }
          />
        );

      })}

    </svg>
  );
}


export default GameBoard;