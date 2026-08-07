export interface HexPosition {
  x: number;
  y: number;
}
export interface Point {
  x: number;
  y: number;
}
export interface GeneratedNode {
  id: string;
  x: number;
  y: number;
}
export interface GeneratedEdge {
  id: string;
  nodeA: string;
  nodeB: string;
  adjacentHexes: string[];
}
export function pointKey(
  point: Point
): string {
  const precision = 1000;
  const x =
    Math.round(
      point.x * precision
    ) / precision;
  const y =
    Math.round(
      point.y * precision
    ) / precision;
  return `${x},${y}`;
}
/*
Flat-top hex corners
*/
export function hexCorners(
  center: HexPosition,
  size: number
): Point[] {
  const corners: Point[] = [];
  for(
    let i = 0;
    i < 6;
    i++
  ){
    const angle =
      Math.PI / 180 *
      (30 + 60 * i);
    corners.push({
      x:
        center.x +
        size *
        Math.cos(angle),
      y:
        center.y +
        size *
        Math.sin(angle),
    });
  }
  return corners;
}
/*
Generate unique settlement nodes
*/
export function generateNodes(
  hexes: HexPosition[],
  size: number
): GeneratedNode[] {
  const nodeMap =
    new Map<string, GeneratedNode>();
  hexes.forEach(
    hex => {
      const corners =
        hexCorners(
          hex,
          size
        );
      corners.forEach(
        point => {
          const key =
            pointKey(point);
          if(
            !nodeMap.has(key)
          ){
            nodeMap.set(
              key,
              {
                id:
                  `node-${nodeMap.size + 1}`,
                x:
                  point.x,
                y:
                  point.y,
              }
            );
          }
        }
      );
    }
  );
  return Array.from(
    nodeMap.values()
  );
}
/*
Generate unique road edges
*/
export function generateEdges(
  hexes: HexPosition[],
  size: number,
  nodes: GeneratedNode[]
): GeneratedEdge[] {

  const edgeMap =
    new Map<string, GeneratedEdge>();

  const nodeLookup =
    new Map<string, GeneratedNode>();

  nodes.forEach((node) => {
    nodeLookup.set(
      pointKey(node),
      node
    );
  });

  hexes.forEach((hex, hexIndex) => {

    const corners =
      hexCorners(
        hex,
        size
      );

    for (
      let i = 0;
      i < 6;
      i++
    ) {

      const a =
        nodeLookup.get(
          pointKey(
            corners[i]
          )
        );

      const b =
        nodeLookup.get(
          pointKey(
            corners[
              (i + 1) % 6
            ]
          )
        );

      if (
        !a ||
        !b
      ) {
        continue;
      }

      const key =
        [
          a.id,
          b.id,
        ]
          .sort()
          .join("-");

      const hexId =
        `hex-${hexIndex + 1}`;

      const existing =
        edgeMap.get(key);

      if (existing) {

        existing.adjacentHexes.push(
          hexId
        );

      } else {

        edgeMap.set(
          key,
          {
            id:
              `edge-${edgeMap.size + 1}`,

            nodeA:
              a.id,

            nodeB:
              b.id,

            adjacentHexes: [
              hexId,
            ],
          }
        );

      }

    }

  });

  return Array.from(
    edgeMap.values()
  );

}