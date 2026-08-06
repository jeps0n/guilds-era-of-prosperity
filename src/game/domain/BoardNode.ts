export interface BoardNode {
  id: string;

  x: number;
  y: number;

  adjacentTiles: string[];
}