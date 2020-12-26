import { Component } from '@angular/core';
import { identity, random, mapValues, keyBy, range, map, difference, chunk, zip } from 'lodash';
import { Subject } from 'rxjs';
import { GameStatus, TicTacToeCell } from './tic-tac-toe.model';


@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.sass']
})
export class TicTacToeComponent {

  readonly n = 3;
  readonly size = this.n ** 2 + 1;
  readonly gameStatus = GameStatus;
  readonly gameOverInfos = [
    {
      sentence: 'You win!',
      color: 'green'
    },
    {
      sentence: 'You loose...',
      color: 'red'
    },
    {
      sentence: 'Draw!',
      color: 'orange'
    }
  ];

  readonly indexes = range(1, this.size);
  readonly matrix  = chunk(this.indexes, this.n);

  readonly ticTacToeCells: TicTacToeCell = mapValues(keyBy(this.indexes), () => null);

  readonly winningCombinations = [
    // Each line
    ...this.matrix,
    // Each column (transpose of lines)
    ...zip(...this.matrix),
    // Diagonals
    range(this.n).map((_, i) => 1 + i * (this.n + 1)),
    range(this.n).map((_, i) => this.n * (1 + i) - i)
  ];

  readonly gameOver$ = new Subject<GameStatus>();

  playerMove(key: number) {
    this.ticTacToeCells[key] = 'x';

    const cellsLeft = map(this.ticTacToeCells, (x, i) => !x && i).filter(identity);
    const left = cellsLeft.length;

    if (left) {
      this.ticTacToeCells[Number(cellsLeft[random(left - 1)])] = 'o';
    }

    this.checkWinner();
  }

  private checkWinner() {
    const x = this.moves('x');
    const moves = x.length;

    if (moves >= this.n) {
      if (this.checkWinningCombination(x)) {
        this.gameOver$.next(GameStatus.PlayerWon);
      } else if (this.checkWinningCombination(this.moves('o'))) {
        this.gameOver$.next(GameStatus.PlayerLost);
      } else if (moves === this.size / 2) {
        this.gameOver$.next(GameStatus.Draw);
      }
    }
  }

  private moves(player: 'x' | 'o') {
    return map(this.ticTacToeCells, (x, i) => x === player ? Number(i) : null).filter(x => x !== null);
  }

  private checkWinningCombination(moves: number[]) {
    return this.winningCombinations.some(x => !difference(x, moves).length);
  }

  reset() {
    this.gameOver$.next(null);
    Object.assign(this.ticTacToeCells, mapValues(keyBy(this.indexes), () => null));
  }

}
