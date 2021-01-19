import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { gameOverInfos, GameStatus, Matrix, Player, TicTacToeService } from '../../store/tic-tac-toe/tic-tac-toe.index';

import * as _ from 'lodash';
import { merge, Observable } from 'rxjs';
import { map, filter, skipWhile, tap, takeUntil, shareReplay, debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicTacToeComponent implements OnInit {
  /** Matrix order */
  private readonly n = 3;
  private readonly gameStatus = GameStatus;
  readonly gameOverInfos = gameOverInfos;
  readonly player1: Player = history.state.player || 'x';
  readonly player2: Player = this.player1 === 'x' ? 'o' : 'x';

  public matchId: string;

  readonly matrix = new Matrix(this.n);

  readonly reset$ = this.matrix.reset$.pipe(
    tap(() => this.pcPlayerMovements$.subscribe())
  ) as Observable<null>;

  // Everytime a player moves, it should check (after this.n movements) if there's a winner
  readonly gameOver$ = merge(
    this.reset$,
    this.matrix.movement$.pipe(
      skipWhile(
        () =>
          this.matrix.movements.x.length < this.n &&
          this.matrix.movements.o.length < this.n
      ),
      map(m => {
        const status = this.gameStatus;
        if (this.matrix.checkWinningCombination(m.player)) {

          const winningMovements = this.matrix.getWinningCombination(m.player);
          this.matrix.flattenedValues.forEach(x =>
            winningMovements.some(y => y === x.id) ? (x.style += ' blink') : null
          );

          return m.player === this.player1 ? status.PlayerWon : status.PlayerLost;
        } else {
          const movementsX = this.matrix.movements.x.length;
          const movementsO = this.matrix.movements.o.length;
          const movementLimit = Math.floor(this.matrix.size / 2);

          if (movementsX >= movementLimit || movementsO >= movementLimit) {
            this.matrix.flattenedValues.forEach(x => x.style += ' blink');
            return status.Draw;
          }
        }
      }),
      filter(x => !!x)
    )
  );

  readonly opponentTurn$ = this.matrix.movement$.pipe(
    map(p => p.player === this.player1),
    shareReplay(1)
  );

  readonly pcPlayerMovements$ = this.opponentTurn$.pipe(
    takeUntil(this.gameOver$),
    filter(p => p),
    debounceTime(1),
    tap(() => this.pcMove())
  );

  readonly movements$ = this.matrix.movement$.pipe(
    tap(() => this.service.updateGameState(this.matchId, this.matrix.movements))
  );

  constructor(
    private route: ActivatedRoute,
    public service: TicTacToeService,
    public cdr: ChangeDetectorRef
  ) {}

  // This is a logic to make PC not so dumb when playing.
  private pcMove() {
    const cellsLeft = this.matrix.flattenedValues
      .map(x => x.value ? null : x.id)
      .filter(_.identity);

    const amountLeft = cellsLeft.length;

    let nextMove: number;

    if (amountLeft) {
      // If n is odd and matrix has not a value on the central element
      const centerIndex = this.n % 2 && Math.floor((this.n - 1) / 2);
      const centerValue = this.matrix.values[centerIndex][centerIndex].value;

      if (!centerValue) {
        nextMove = this.matrix.values[centerIndex][centerIndex].id;
      } else {
        const o = this.matrix.movements.o;

        if (o.length) {
          const x = this.matrix.movements.x;

          const differencesX = this.matrix.winningCombinations.map(c =>
            _.difference(c, x)
          );
          const minX = [...differencesX].sort((a, b) => a.length - b.length);
          const hinderPlayer = _.uniq(
            _.flatMap(minX.map(y => _.intersection(y, cellsLeft)))
          );

          const differencesO = this.matrix.winningCombinations.map((c) =>
            _.difference(c, o)
          );
          const minO = [...differencesO].sort((a, b) => a.length - b.length);
          const seekVictory = _.uniq(
            _.flatMap(minO.map(y => _.intersection(y, cellsLeft)))
          );

          const common = _.intersection(hinderPlayer, seekVictory);
          const winningMove = common.find(y =>
            this.matrix.checkWinningCombination(this.player2, y)
          );

          nextMove =
            winningMove ||
            _.head(common) ||
            _.head(hinderPlayer) ||
            _.head(seekVictory);
        } else {
          nextMove = cellsLeft[_.random(amountLeft - 1)];
        }
      }
      this.matrix.movementTrigger$.next({ id: nextMove, player: this.player2 });
    }
  }

  ngOnInit() {
    this.route.params.pipe(
      tap((x: { id: string }) => {
        if (x?.id) {
          this.movements$.subscribe();
          this.matchId = x.id;
          if (history.state.movements) {
            this.matrix.updateGameState(history.state.movements);
          }

          this.service.getGameState(x.id).pipe(
            tap(y => {
              this.matrix.updateGameState(y.data);
              this.cdr.detectChanges();
            })
          ).subscribe();

        } else {
          this.pcPlayerMovements$.subscribe();
        }
      }
    )).subscribe();
  }
}
