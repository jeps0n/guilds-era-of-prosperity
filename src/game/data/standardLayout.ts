export interface AxialCoordinate {
  q: number;
  r: number;
}

export interface HexPosition {
  x: number;
  y: number;
}


const SIZE = 75;


/*
  Standard 19 hex game board

        3
      4 4
    5 5 5
      4 4
        3

  Pointy-top axial layout
*/


export const STANDARD_AXIAL_COORDS:
  AxialCoordinate[] = [];


for (let r = -2; r <= 2; r++) {

  for (let q = -2; q <= 2; q++) {

    const s =
      -q - r;


    if (
      Math.max(
        Math.abs(q),
        Math.abs(r),
        Math.abs(s)
      ) <= 2
    ) {

      STANDARD_AXIAL_COORDS.push({
        q,
        r,
      });

    }

  }

}



export function axialToPixel(
  hex: AxialCoordinate
): HexPosition {

  return {

    x:
      SIZE *
      Math.sqrt(3) *
      (
        hex.q +
        hex.r / 2
      ),


    y:
      SIZE *
      1.5 *
      hex.r,

  };

}



export const STANDARD_HEX_LAYOUT:
  HexPosition[] =
    STANDARD_AXIAL_COORDS.map(
      axialToPixel
    );