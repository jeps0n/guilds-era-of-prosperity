import type { BoardNode } from "../domain/BoardNode";
import {
  generateNodes,
  generateEdges,
  hexCorners,
} from "./hexGrid";

import {
  STANDARD_HEX_LAYOUT,
} from "./standardLayout";

import type { HexTile } from "../domain/HexTile";

import {
  RESOURCE_LAYOUT,
} from "./resourceLayout";

import {
  NUMBER_LAYOUT,
} from "./numberLayout";


const SIZE = 75;


function shuffle<T>(array: T[]): T[] {
  return [...array].sort(
    () => Math.random() - 0.5
  );
}


const generatedNodes =
  generateNodes(
    STANDARD_HEX_LAYOUT,
    SIZE
  );


export const GENERATED_NODES:
BoardNode[] =
generatedNodes.map((node) => {

  const adjacentTiles: string[] = [];


  STANDARD_HEX_LAYOUT.forEach(
    (hex, index) => {

      const corners =
        hexCorners(
          hex,
          SIZE
        );


      const touching =
        corners.some(
          (corner) =>
            Math.abs(corner.x - node.x) < 0.001 &&
            Math.abs(corner.y - node.y) < 0.001
        );


      if (touching) {
        adjacentTiles.push(
          `hex-${index + 1}`
        );
      }

    }
  );


  return {
    id: node.id,
    x: node.x,
    y: node.y,
    adjacentTiles,
  };

});



function isAdjacent(
a: HexTile,
b: HexTile
): boolean {

return (
  Math.abs(a.x - b.x) < SIZE * 1.8 &&
  Math.abs(a.y - b.y) < SIZE * 1.6
);

}



function generateTiles(): HexTile[] {

const resources =
  shuffle(
    RESOURCE_LAYOUT
  );


const numbers =
  shuffle(
    NUMBER_LAYOUT.filter(
      (
        number
      ): number is number =>
        number !== null
    )
  );


let numberIndex = 0;


const tiles =
STANDARD_HEX_LAYOUT.map(
(hex,index)=>{

  const resource =
    resources[index];


  return {

    id:
      `hex-${index + 1}`,

    x:
      hex.x,

    y:
      hex.y,

    resource,

    numberToken:
      resource === "desert"
      ? undefined
      : numbers[numberIndex++],

  };

});


return tiles;

}



function validateSixEightRule(
tiles: HexTile[]
): boolean {


const highNumberTiles =
tiles.filter(
(tile)=>
tile.numberToken === 6 ||
tile.numberToken === 8
);



for(
let i = 0;
i < highNumberTiles.length;
i++
){

for(
let j = i + 1;
j < highNumberTiles.length;
j++
){

if(
isAdjacent(
highNumberTiles[i],
highNumberTiles[j]
)
){
return false;
}

}

}


return true;

}



function createValidTiles(): HexTile[] {


let attempts = 0;


while(attempts < 1000){

const tiles =
generateTiles();


if(
validateSixEightRule(
tiles
)
){

return tiles;

}


attempts++;

}


throw new Error(
"Could not generate valid Catan board"
);


}



export const GENERATED_TILES =
createValidTiles();



export const GENERATED_EDGES =
generateEdges(
  STANDARD_HEX_LAYOUT,
  SIZE,
  generatedNodes
);