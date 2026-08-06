export interface BoardNode {
  id: string;

  adjacentTiles: string[];

  occupantId?: string;
}