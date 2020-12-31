import { Component } from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Edges, GameStatus, TicTacToeCell } from './tic-tac-toe.model';


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
      sentence: 'You lose...',
      color: 'red'
    },
    {
      sentence: 'Draw!',
      color: 'orange'
    }
  ];

  readonly indexes = _.range(1, this.size);
  readonly matrix  = _.chunk(this.indexes, this.n);
  readonly transposedMatrix = _.zip(...this.matrix);

  readonly ticTacToeCells: TicTacToeCell = _.mapValues(_.keyBy(this.indexes), () => null);

  readonly winningCombinations = [
    // Each line
    ...this.matrix,
    // Each column (transpose of lines)
    ...this.transposedMatrix,
    // Diagonals
    _.range(this.n).map((v, i) => 1 + i * (this.n + 1)),
    _.range(this.n).map((v, i) => this.n * (1 + i) - i)
  ];

  readonly edges: Edges = {
    top: _.head(this.matrix),
    left: _.head(this.transposedMatrix),
    right: _.last(this.transposedMatrix),
    bottom: _.last(this.matrix),
  };

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

  isOfSide(side: keyof(Edges), element: number) {
    return this.edges[side].some(x => x === element);
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
        this.winComb = _.flatMap(this.matrix);
      }
    }
  }

  private moves(player: 'x' | 'o') {
    return _.map(this.ticTacToeCells, (x, i) => x === player ? Number(i) : null).filter(x => x !== null);
  }

  private checkWinningCombination(moves: number[]) {
    return this.winningCombinations.some(x => !_.difference(x, moves).length);
  }

  private getWinningCombination(moves: number[]) {
    return this.winningCombinations.find(x => !_.difference(x, moves).length);
  }

  // This is a logic to make PC not so dumb when playing.
  private pcMove() {
    const cellsLeft = _.map(this.ticTacToeCells, (x, i) => !x && i)
      .filter(_.identity)
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

          const differencesX = this.winningCombinations.map(c => _.difference(c, x));
          const minX = [...differencesX].sort((a, b) => a.length - b.length);
          const hinderPlayer = _.uniq(_.flatMap(minX.map(y => _.intersection(y, cellsLeft))));

          const differencesO = this.winningCombinations.map(c => _.difference(c, o));
          const minO = [...differencesO].sort((a, b) => a.length - b.length);
          const seekVictory = _.uniq(_.flatMap(minO.map(y => _.intersection(y, cellsLeft))));

          const common = _.intersection(hinderPlayer, seekVictory);
          const winningMove = common.find(y => this.checkWinningCombination([...o, y]));

          const nextMove = winningMove ||
            _.head(common) ||
            _.head(hinderPlayer) ||
            _.head(seekVictory)  ||
            cellsLeft[_.random(left - 1)];

          this.ticTacToeCells[nextMove] = 'o';
        } else {
          this.ticTacToeCells[cellsLeft[_.random(left - 1)]] = 'o';
        }
      }
    }
    this.checkWinner();
  }

  reset() {
    this.winComb = null;
    this.gameOver$.next(null);
    Object.assign(this.ticTacToeCells, _.mapValues(_.keyBy(this.indexes), () => null));
  }

}
