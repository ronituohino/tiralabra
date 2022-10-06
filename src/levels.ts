/**
 * @file Level objects for the game.
 */
export const levels = {
  one: {
    name: "One",
    board: [
      [0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, -1, 0, 0, 0],
      [0, 0, 0, -1, -1, 0],
    ],
    startTiles: [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 4],
      [2, 4],
      [3, 5],
      [2, 3],
      [2, 2],
      [3, 2],
      [3, 1],
    ],
  },
  two: { name: "Two", board: [[0]], startTiles: [[0, 0]] },
  test: {
    name: "Test level",
    board: [
      [-1, 0],
      [0, 0, 0, 0],
      [0, 0, -1, 0],
      [0, -1, -1, 0, 0, 0, 0],
      [-1, 0, -1, 0, 0, 0, 0, 0],
      [-1, -1, 0, -1, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [-1, -1, -1, -1, 0],
    ],
    startTiles: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 0],
      [2, 3],
      [3, 0],
      [3, 4],
      [3, 5],
      [3, 6],
      [4, 1],
      [4, 5],
      [4, 6],
      [4, 7],
      [5, 2],
      [5, 5],
      [6, 0],
      [6, 1],
      [6, 2],
      [6, 3],
      [6, 4],
      [6, 5],
      [7, 4],
    ],
  },
};
