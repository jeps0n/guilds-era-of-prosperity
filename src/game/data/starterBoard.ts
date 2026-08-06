import {
  GENERATED_NODES,
  GENERATED_EDGES,
  GENERATED_TILES,
} from "./generatedBoard";


export const STARTER_BOARD = {
  tiles: GENERATED_TILES,
  nodes: GENERATED_NODES,
  edges: GENERATED_EDGES,
};


console.log(
  "=== BOARD CHECK ===",
  {
    tiles: STARTER_BOARD.tiles.length,
    nodes: STARTER_BOARD.nodes.length,
    edges: STARTER_BOARD.edges.length,
  }
);