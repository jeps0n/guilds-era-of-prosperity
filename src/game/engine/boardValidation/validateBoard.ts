import type { Board } from "../../domain/Board";


function countResources(board: Board) {

  return board.tiles.reduce(
    (counts, tile) => {

      counts[tile.resource]++;

      return counts;

    },
    {
      brick: 0,
      lumber: 0,
      wheat: 0,
      sheep: 0,
      ore: 0,
      desert: 0,
    }
  );

}



function validateResourceDistribution(
  board: Board
): boolean {

  const counts =
    countResources(board);


  return (

    counts.brick === 3 &&
    counts.lumber === 4 &&
    counts.wheat === 4 &&
    counts.sheep === 4 &&
    counts.ore === 3 &&
    counts.desert === 1

  );

}



function areAdjacent(
  a: {
    x:number;
    y:number;
  },
  b: {
    x:number;
    y:number;
  }
): boolean {


  return (

    Math.abs(a.x - b.x) < 140 &&
    Math.abs(a.y - b.y) < 130

  );

}



function validateSixEightRule(
  board: Board
): boolean {


  const highTiles =
    board.tiles.filter(
      tile =>
        tile.numberToken === 6 ||
        tile.numberToken === 8
    );


  for(
    let i = 0;
    i < highTiles.length;
    i++
  ){

    for(
      let j = i + 1;
      j < highTiles.length;
      j++
    ){

      if(
        areAdjacent(
          highTiles[i],
          highTiles[j]
        )
      ){

        return false;

      }

    }

  }


  return true;

}



function validateBoardStructure(
  board: Board
): boolean {

  return (

    board.tiles.length === 19 &&
    board.nodes.length === 54 &&
    board.edges.length === 72

  );

}



export function validateBoard(
  board: Board
): void {


  const results = {

    structure:
      validateBoardStructure(board),

    resources:
      validateResourceDistribution(board),

    sixEightRule:
      validateSixEightRule(board),

  };



  console.log(
    "BOARD VALIDATION",
    results
  );



  if(
    Object.values(results)
      .some(
        result => result === false
      )
  ){

    throw new Error(
      "Invalid Catan board generated"
    );

  }


}