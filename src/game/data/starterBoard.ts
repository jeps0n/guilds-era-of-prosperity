import type { Board } from "../domain/Board";

export const STARTER_BOARD: Board = {
  tiles: [
    {
      id: "hex-1",
      resource: "lumber",
      numberToken: 8,
    },
    {
      id: "hex-2",
      resource: "brick",
      numberToken: 5,
    },
    {
      id: "hex-3",
      resource: "wheat",
      numberToken: 9,
    },
    {
      id: "hex-4",
      resource: "sheep",
      numberToken: 6,
    },
    {
      id: "hex-5",
      resource: "ore",
      numberToken: 10,
    },
    {
      id: "hex-6",
      resource: "desert",
    },
  ],

  nodes: [
    {
      id: "node-1",
      adjacentTiles: [
        "hex-1",
      ],
    },
    {
      id: "node-2",
      adjacentTiles: [
        "hex-1",
        "hex-2",
      ],
    },
    {
      id: "node-3",
      adjacentTiles: [
        "hex-2",
        "hex-3",
      ],
    },
    {
      id: "node-4",
      adjacentTiles: [
        "hex-3",
      ],
    },
  ],

  edges: [
    {
      id: "edge-1",
      nodeA: "node-1",
      nodeB: "node-2",
    },
    {
      id: "edge-2",
      nodeA: "node-2",
      nodeB: "node-3",
    },
    {
      id: "edge-3",
      nodeA: "node-3",
      nodeB: "node-4",
    },
  ],
};