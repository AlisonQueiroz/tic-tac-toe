export interface TicTacToeCell {
  [x: number]: 'x' | 'o' | null;
}

export enum GameStatus {
  PlayerWon = 1,
  PlayerLost,
  Draw
}