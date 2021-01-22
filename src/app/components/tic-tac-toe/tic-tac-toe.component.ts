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

  /**
   * Everytime a player moves, it should check (after this.n movements) if there's a winner
   */
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

          this.matrix.blink(m.player);
          return m.player === this.player1 ? status.PlayerWon : status.PlayerLost;

        } else {
          const movementsX = this.matrix.movements.x.length;
          const movementsO = this.matrix.movements.o.length;
          const movementLimit = Math.floor(this.matrix.size / 2);

          if (movementsX >= movementLimit || movementsO >= movementLimit) {
            this.matrix.blink();
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
    const cellsLeft = this.matrix.flat
      .map(c => c.value ? null : c.id)
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
        const pc = this.matrix.movements[this.player2];

        if (pc.length) {
          const player = this.matrix.movements[this.player1];

          const differencesPlayer = this.matrix.winningCombinations.map(c =>
            _.difference(c, player)
          );
          const minPlayer = [...differencesPlayer].sort((a, b) => a.length - b.length);
          const hinderPlayer = _.uniq(
            _.flatMap(minPlayer.map(y => _.intersection(y, cellsLeft)))
          );

          const differencesPc = this.matrix.winningCombinations.map((c) =>
            _.difference(c, pc)
          );
          const minPc = [...differencesPc].sort((a, b) => a.length - b.length);
          const seekVictory = _.uniq(
            _.flatMap(minPc.map(y => _.intersection(y, cellsLeft)))
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
            tap(state => {
              this.matrix.updateGameState(state.data);
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
