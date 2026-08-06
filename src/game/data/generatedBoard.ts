import type { BoardNode } from "../domain/BoardNode";

import {
  generateNodes,
  generateEdges,
  hexCorners
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


const shuffledResources =
  shuffle(RESOURCE_LAYOUT);

const shuffledNumbers =
  shuffle(NUMBER_LAYOUT);


export const GENERATED_TILES: HexTile[] =
  STANDARD_HEX_LAYOUT.map((hex, index) => ({
    id: `hex-${index + 1}`,
    x: hex.x,
    y: hex.y,

    resource:
      shuffledResources[index],

    numberToken:
      shuffledNumbers[index] ?? undefined,
  }));



export const GENERATED_EDGES =
  generateEdges(
    STANDARD_HEX_LAYOUT,
    SIZE,
    generatedNodes
  );