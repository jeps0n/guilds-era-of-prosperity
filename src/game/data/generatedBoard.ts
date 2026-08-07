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
import type { Port } from "../domain/Port";
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
          corner =>
            Math.abs(
              corner.x - node.x
            ) < 0.001
            &&
            Math.abs(
              corner.y - node.y
            ) < 0.001
        );
      if (touching) {
        adjacentTiles.push(
          `hex-${index + 1}`
        );
      }
    }
  );
  return {
    id:
      node.id,
    x:
      node.x,
    y:
      node.y,
    adjacentTiles,
  };
});
export const GENERATED_EDGES =
generateEdges(
  STANDARD_HEX_LAYOUT,
  SIZE,
  generatedNodes
);
function isAdjacent(
  a: HexTile,
  b: HexTile
): boolean {
  return (
    Math.abs(
      a.x - b.x
    ) < SIZE * 1.8
    &&
    Math.abs(
      a.y - b.y
    ) < SIZE * 1.6
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
  return STANDARD_HEX_LAYOUT.map(
    (hex, index) => {
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
            ?
            undefined
            :
            numbers[numberIndex++],
      };
    }
  );
}
function validateSixEightRule(
  tiles: HexTile[]
): boolean {
  const highNumberTiles =
    tiles.filter(
      tile =>
        tile.numberToken === 6
        ||
        tile.numberToken === 8
    );
  for (
    let i = 0;
    i < highNumberTiles.length;
    i++
  ) {
    for (
      let j = i + 1;
      j < highNumberTiles.length;
      j++
    ) {
      if (
        isAdjacent(
          highNumberTiles[i],
          highNumberTiles[j]
        )
      ) {
        return false;
      }
    }
  }
  return true;
}
function createValidTiles(): HexTile[] {
  let attempts = 0;
  while (
    attempts < 1000
  ) {
    const tiles =
      generateTiles();
    if (
      validateSixEightRule(
        tiles
      )
    ) {
      return tiles;
    }
    attempts++;
  }
  throw new Error(
    "Could not generate valid game board"
  );
}
export const GENERATED_TILES =
createValidTiles();
function orderCoastalEdgesClockwise(
  edges: typeof GENERATED_EDGES
): typeof GENERATED_EDGES {
  const coastalEdges =
    edges.filter(
      edge =>
        edge.adjacentHexes.length === 1
    );
  return coastalEdges.sort(
    (a, b) => {
      const aNodeA =
        GENERATED_NODES.find(
          node =>
            node.id === a.nodeA
        );
      const aNodeB =
        GENERATED_NODES.find(
          node =>
            node.id === a.nodeB
        );
      const bNodeA =
        GENERATED_NODES.find(
          node =>
            node.id === b.nodeA
        );
      const bNodeB =
        GENERATED_NODES.find(
          node =>
            node.id === b.nodeB
        );
      if (
        !aNodeA
        ||
        !aNodeB
        ||
        !bNodeA
        ||
        !bNodeB
      ) {
        return 0;
      }
      const aMidX =
        (
          aNodeA.x +
          aNodeB.x
        ) / 2;
      const aMidY =
        (
          aNodeA.y +
          aNodeB.y
        ) / 2;
      const bMidX =
        (
          bNodeB.x +
          bNodeA.x
        ) / 2;
      const bMidY =
        (
          bNodeB.y +
          bNodeA.y
        ) / 2;
      const aAngle =
        Math.atan2(
          aMidY,
          aMidX
        );
      const bAngle =
        Math.atan2(
          bMidY,
          bMidX
        );
      return aAngle - bAngle;
    }
  );
}
function placePortsOnCoast(): Port[] {
  const coastalEdges =
    orderCoastalEdgesClockwise(
      GENERATED_EDGES
    );
  if (
    coastalEdges.length !== 30
  ) {
    throw new Error(
      `Expected 30 coastal edges, found ${coastalEdges.length}`
    );
  }
  const portSpacing =[
      2,
      3,
      2,
      2,
      3,
      2,
      2,
      3,
      2,
    ];
  const portTypes:
    Port["type"][] =[
      "generic",
      "generic",
      "generic",
      "generic",
      "brick",
      "lumber",
      "wheat",
      "sheep",
      "ore",
    ];
  const selectedEdges:
    typeof GENERATED_EDGES =
    [];
  let currentIndex =
    Math.floor(
      Math.random() *
      coastalEdges.length
    );
  for (
    let i = 0;
    i < portSpacing.length;
    i++
  ) {
    selectedEdges.push(
      coastalEdges[currentIndex]
    );
    currentIndex =
      (
        currentIndex +
        portSpacing[i] +
        1
      )
      %
      coastalEdges.length;
  }
  return selectedEdges.map(
    (edge, index) => ({
      id:
        `port-${index + 1}`,
      edgeId:
        edge.id,
      nodeIds:
        [
          edge.nodeA,
          edge.nodeB,
        ],
      type:
        portTypes[index],
      ratio:
        portTypes[index] === "generic"
          ?
          3
          :
          2,
    })
  );
}
export const GENERATED_PORTS =
placePortsOnCoast();