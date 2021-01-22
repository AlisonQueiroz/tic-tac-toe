import * as _ from 'lodash';
import { Observable, Subject } from 'rxjs';
import { filter, shareReplay, tap } from 'rxjs/operators';

export enum GameStatus {
  PlayerWon = 1,
  PlayerLost,
  Draw,
}

export interface GameOverMessage {
  sentence: string;
  color: string;
}

export const gameOverInfos: GameOverMessage[] = [
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

export class TicTacToeCell {
  readonly id: number;
  style: Border = '';
  value?: Player;

  constructor(id: number, n: number) {
    this.id = id;
    if (id <= n) {
      this.style = 'top';
    }
    if (id % n === 0) {
      this.style += ' right';
    }
    if (id % n === 1) {
      this.style += ' left';
    }
    if (id >= 1 + (n - 1) * n && id <= n ** 2) {
      this.style += ' bottom';
    }
  }
}

interface Movement {
  id: number;
  player: Player;
}

export class Matrix {
  readonly n: number;
  readonly size: number;
  readonly indexes: number[];
  readonly values: TicTacToeCell[][];
  readonly flat: TicTacToeCell[];
  readonly winningCombinations: number[][];
  readonly resetTrigger$ = new Subject<GameStatus>();

  public movements = new PlayersMovements();
  readonly movement$: Observable<Movement>;
  readonly movementTrigger$ = new Subject<Movement>();

  readonly reset$ = this.resetTrigger$.pipe(
    tap(() => {
      this.movements = new PlayersMovements();

      const blink = ' blink';
      this.flat.forEach(c => {
        c.value = null;
        if (c.style.includes(blink)) {
          c.style = _.head(c.style.split(blink)) as Border;
        }
      });
    })
  );

  constructor(n: number) {
    this.n = n;
    this.size = this.n ** 2 + 1;
    this.indexes = _.range(1, this.size);
    this.flat = this.indexes.map(id => new TicTacToeCell(id, this.n));
    this.values = _.chunk(this.flat, this.n);

    this.winningCombinations = [
      // Each line
      ...this.values.map(x => x.map(y => y.id)),

      // Each column (transpose of lines)
      ..._.zip(...this.values).map(x => x.map(y => y.id)),

      // Diagonals
      _.range(this.n).map((v, i) => 1 + i * (this.n + 1)),
      _.range(this.n).map((v, i) => this.n * (1 + i) - i),
    ];

    this.movement$ = this.movementTrigger$.pipe(
      filter(x => !!x),
      tap(p => {
        this.movements[p.player].push(p.id);
        this.flat.find(x => x.id === p.id).value = p.player;
      }),
      shareReplay(1)
    );

  }

  /** Make winning cells blink.
   * This is a impure function, call it just once
   */
  blink(player?: Player) {
    const blink = ' blink';
    if (player) {
      const winningCombination = this.getWinningCombination(player);
      this.flat.forEach(x =>
        winningCombination.some(y => y === x.id) ? (x.style += blink) : null
      );
    } else {
      this.flat.forEach(x => x.style += blink);
    }
  }

  checkWinningCombination(player: Player, extra?: number) {
    const combination = [...this.movements[player], extra];
    return this.winningCombinations.some(x => !_.difference(x, combination).length);
  }

  getWinningCombination(player?: Player) {
    return this.winningCombinations.find(x => !_.difference(x, this.movements[player]).length);
  }

  updateGameState(movements: PlayersMovements) {
    _.forEach(movements, (m, k) =>
      m.forEach(p =>
        this.flat.forEach(v => {
          if (v.id === p) {
            v.value = k as Player;
          }
        })
      )
    );
    this.movements = movements;
  }
}

export type Border =
  | ''
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top right'
  | 'top left'
  | 'bottom right'
  | 'bottom left';

export type Player = 'x' | 'o';

export class PlayersMovements {
  x: number[] = [];
  o: number[] = [];
}
