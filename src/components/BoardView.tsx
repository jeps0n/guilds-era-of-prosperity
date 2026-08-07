import { useState } from "react";

import type { Board } from "../game/domain/Board";
import type { Settlement } from "../game/domain/Settlement";

interface BoardViewProps {
  board: Board;

  settlements: Settlement[];

  roads: {
    id: string;
    edgeId: string;
    playerId: string;
  }[];

  onSelectNode?: (
    nodeId: string
  ) => void;

  onSelectEdge?: (
    edgeId: string
  ) => void;
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
        Math.PI / 180 *
        (30 + i * 60);

      return [
        x + SIZE * Math.cos(angle),
        y + SIZE * Math.sin(angle),
      ].join(",");

    }
  ).join(" ");

}


function BoardView({
  board,
  settlements,
  roads,
  onSelectNode,
  onSelectEdge,
}: BoardViewProps) {


const [hoveredEdge, setHoveredEdge] =
useState<string | null>(null);


const [hoveredNode, setHoveredNode] =
useState<string | null>(null);



return (

<div>

<svg

width="800"

height="600"

viewBox="-375 -333 750 666"

style={{
background:"#3b82f6",
borderRadius:"18px",
boxShadow:
"0 12px 30px rgba(0,0,0,0.35)"
}}

>


{board.tiles.map((tile)=>(

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
brick:"#b45309",
lumber:"#166534",
wheat:"#eab308",
sheep:"#65a30d",
ore:"#6b7280",
desert:"#d6c28a",
}[tile.resource]
}

stroke="#111827"

strokeWidth="2"

/>


{tile.numberToken && (

<>

<rect

x={tile.x - 18}

y={tile.y - 18}

width="36"

height="36"

rx="8"

fill="#f9fafb"

stroke="#111827"

strokeWidth="2"

/>


<text

x={tile.x}

y={tile.y}

textAnchor="middle"

dominantBaseline="middle"

fontSize="16"

fontWeight="bold"

fill="#111827"

>

{tile.numberToken}

</text>


</>

)}



{/* DEBUG TERRAIN LABEL */}

<text

x={tile.x}

y={tile.y + 38}

textAnchor="middle"

fontSize="10"

fill="white"

fontWeight="bold"

>

{tile.resource}

</text>


</g>

))}



{/* ROADS */}

{board.edges.map((edge)=>{

const a =
board.nodes.find(
n => n.id === edge.nodeA
);


const b =
board.nodes.find(
n => n.id === edge.nodeB
);


if(!a || !b){
return null;
}


const road =
roads.find(
r => r.edgeId === edge.id
);


const isHovered =
hoveredEdge === edge.id;



return (

<g key={edge.id}>


{road && (

<line

x1={a.x}

y1={a.y}

x2={b.x}

y2={b.y}

stroke="#000000"

strokeWidth="16"

strokeLinecap="round"

pointerEvents="none"

/>

)}



{road && (

<line

x1={a.x}

y1={a.y}

x2={b.x}

y2={b.y}

stroke={
isHovered
?"#ff0000"
:
road.playerId === "player-1"
?"#f97316"
:"#9333ea"
}

strokeWidth="10"

strokeLinecap="round"

pointerEvents="none"

/>

)}



{!road && (

<line

x1={a.x}

y1={a.y}

x2={b.x}

y2={b.y}

stroke={
isHovered
?"#ff0000"
:"#78350f"
}

strokeWidth={
isHovered
?"10"
:"6"
}

strokeLinecap="round"

pointerEvents="none"

/>

)}



<line

x1={a.x}

y1={a.y}

x2={b.x}

y2={b.y}

stroke="transparent"

strokeWidth="22"

onMouseEnter={()=>
setHoveredEdge(edge.id)
}

onMouseLeave={()=>
setHoveredEdge(null)
}

onClick={()=>
onSelectEdge?.(edge.id)
}

style={{
cursor:
onSelectEdge
?"pointer"
:"default"
}}

/>


</g>

);

})}



{/* NODES */}

{board.nodes.map((node)=>{


const settlement =
settlements.find(
s => s.nodeId === node.id
);


const isHovered =
hoveredNode === node.id;



return (

<g key={node.id}>


{settlement ? (

<polygon

points={`
${node.x},${node.y - 18}
${node.x + 16},${node.y - 6}
${node.x + 11},${node.y + 16}
${node.x - 11},${node.y + 16}
${node.x - 16},${node.y - 6}
`}

fill={
isHovered
?"#ff0000"
:
settlement.playerId === "player-1"
?"#f97316"
:"#9333ea"
}

stroke="#000000"

strokeWidth="4"

onMouseEnter={()=>
setHoveredNode(node.id)
}

onMouseLeave={()=>
setHoveredNode(null)
}

onClick={()=>
onSelectNode?.(node.id)
}

/>

)

:

(

<circle

cx={node.x}

cy={node.y}

r={
isHovered
?13
:9
}

fill={
isHovered
?"#ff0000"
:"#2563eb"
}

stroke="white"

strokeWidth="2"

onMouseEnter={()=>
setHoveredNode(node.id)
}

onMouseLeave={()=>
setHoveredNode(null)
}

onClick={()=>
onSelectNode?.(node.id)
}

/>

)

}


</g>

);

})}


</svg>

</div>

);

}


export default BoardView;