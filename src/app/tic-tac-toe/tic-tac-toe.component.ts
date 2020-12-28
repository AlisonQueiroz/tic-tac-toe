import { Component } from '@angular/core';
import { identity, random, mapValues, keyBy, range, map, difference, chunk, zip, head, intersection, uniq, flatMap } from 'lodash';
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
  public winComb: number[];

  playerMove(key: number) {
    this.ticTacToeCells[key] = 'x';
    this.checkWinner();

    this.pcMove();
  }

  isPartOfWinningCombination(element: number) {
    if (!this.winComb) { return; }
    return this.winComb.some(x => x === element);
  }

  private checkWinner() {
    const x = this.moves('x');
    const moves = x.length;

    if (moves >= this.n) {
      if (this.checkWinningCombination(x)) {
        this.gameOver$.next(GameStatus.PlayerWon);
        this.winComb = this.getWinningCombination(x);
      } else if (this.checkWinningCombination(this.moves('o'))) {
        this.gameOver$.next(GameStatus.PlayerLost);
        this.winComb = this.getWinningCombination(this.moves('o'));
      } else if (moves === Math.floor(this.size / 2)) {
        this.gameOver$.next(GameStatus.Draw);
        this.winComb = flatMap(this.matrix);
      }
    }
  }

  private moves(player: 'x' | 'o') {
    return map(this.ticTacToeCells, (x, i) => x === player ? Number(i) : null).filter(x => x !== null);
  }

  private checkWinningCombination(moves: number[]) {
    return this.winningCombinations.some(x => !difference(x, moves).length);
  }

  private getWinningCombination(moves: number[]) {
    const comb = this.winningCombinations.find(x => !difference(x, moves).length);
    return comb;
  }

  // This is a logic to make PC not so dumb when playing.
  private pcMove() {
    const cellsLeft = map(this.ticTacToeCells, (x, i) => !x && i)
      .filter(identity)
      .map(x => Number(x));

    const left = cellsLeft.length;

    if (left) {
      const center = this.ticTacToeCells[this.size / 2];

      if (this.n % 2 && !center) {
        this.ticTacToeCells[this.size / 2] = 'o';
      } else {
        const o = this.moves('o');

        if (o.length) {
          const x = this.moves('x');

          const differencesX = this.winningCombinations.map(c => difference(c, x));
          const minX = [...differencesX].sort((a, b) => a.length - b.length);
          const hinderPlayer = uniq(flatMap(minX.map(y => intersection(y, cellsLeft))));

          const differencesO = this.winningCombinations.map(c => difference(c, o));
          const minO = [...differencesO].sort((a, b) => a.length - b.length);
          const seekVictory = uniq(flatMap(minO.map(y => intersection(y, cellsLeft))));

          const common = intersection(hinderPlayer, seekVictory);
          const winningMove = common.find(y => this.checkWinningCombination([...o, y]));

          const nextMove = winningMove ||
            head(common) ||
            head(hinderPlayer) ||
            head(seekVictory)  ||
            cellsLeft[random(left - 1)];

          this.ticTacToeCells[nextMove] = 'o';
        } else {
          this.ticTacToeCells[cellsLeft[random(left - 1)]] = 'o';
        }
      }
    }
    this.checkWinner();
  }

  reset() {
    this.winComb = null;
    this.gameOver$.next(null);
    Object.assign(this.ticTacToeCells, mapValues(keyBy(this.indexes), () => null));
  }

}
