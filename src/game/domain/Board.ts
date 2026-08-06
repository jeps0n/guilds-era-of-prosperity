import type { HexTile } from "./HexTile";
import type { BoardNode } from "./BoardNode";
import type { BoardEdge } from "./BoardEdge";

export interface Board {
  tiles: HexTile[];

  nodes: BoardNode[];

  edges: BoardEdge[];
}