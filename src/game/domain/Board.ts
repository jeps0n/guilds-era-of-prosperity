import type { HexTile } from "./HexTile";
import type { BoardNode } from "./BoardNode";
import type { BoardEdge } from "./BoardEdge";
import type { Port } from "./Port";

export interface Board {
  tiles: HexTile[];

  nodes: BoardNode[];

  edges: BoardEdge[];

  ports: Port[];
}