import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { gameOverInfos, GameState, GameStatus, getMyPlayer, getPlayer2, Matrix, Player, TicTacToeService } from '../../store/tic-tac-toe/tic-tac-toe.index';

import * as _ from 'lodash';
import { merge, Observable, Subject } from 'rxjs';
import { map, filter, skipWhile, tap, takeUntil, debounceTime, take, shareReplay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { CopyMatchIdDialogComponent, DialogData } from '../copy-match-id-dialog/copy-match-id-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

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
  public player1: Player = history.state.player || 'x';
  public player2: Player = getPlayer2(this.player1);

  public matchId: string;

  readonly matrix = new Matrix(this.n);

  readonly reset$ = this.matrix.reset$.pipe(
    tap(() => {
      if (!this.matchId) {
        this.pcPlayerMovements$.subscribe();
      } else {
        this.service.updateGameState(
          this.matchId,
          this.matrix.gameStateReseted()
        );
      }
    })
  ) as Observable<void>;

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

  readonly opponentTurn$ = new Subject<boolean>();

  readonly pcPlayerMovements$ = this.opponentTurn$.pipe(
    takeUntil(this.gameOver$),
    filter(p => p),
    debounceTime(1),
    tap(() => this.pcMove())
  );

  readonly movements$ = this.matrix.movement$.pipe(
    filter(p => p.player === this.player1),
    tap(p => {
      this.matrix.gameState.turnPlayerId = this.matrix.gameState.playersId[p.player];
      this.service.updateGameState(this.matchId, this.matrix.gameState);
    })
  );

  constructor(
    private route: ActivatedRoute,
    public service: TicTacToeService,
    public cdr: ChangeDetectorRef,
    public dialog: MatDialog
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
      this.opponentTurn$.next(false);
    }
  }

  ngOnInit() {
    this.route.params.pipe(
      tap((x: { id: string }) => {
        if (x?.id) {
          this.movements$.subscribe();
          this.matchId = x.id;
          const gameState = history.state.gameState as GameState;

          this.matrix.updateGameState(gameState);
          this.player1 = getMyPlayer(
            this.service.userId$.value,
            gameState.playersId
          );

          let dialogRef: MatDialogRef<CopyMatchIdDialogComponent, any>;
          if (history.state.openDialog) {
            dialogRef = this.dialog.open(CopyMatchIdDialogComponent, {
              width: '500px',
              height: '240px',
              data: { matchId: x.id } as DialogData
            });
          }

          const getGameState = this.service.getGameState(x.id).pipe(shareReplay(1));
          if (dialogRef) {
            getGameState.pipe(
              filter(y => !!y.playersId[this.player2]),
              take(1),
              tap(() => dialogRef.close())
            ).subscribe();
          }

          getGameState.pipe(
            tap(state => {
              this.matrix.updateGameState(state);
              this.opponentTurn$.next(
                this.service.userId$.value === state.turnPlayerId
              );
              this.cdr.detectChanges();
            })
          ).subscribe();

        } else {
          this.pcPlayerMovements$.subscribe();
        }
      }
    )).subscribe();
  }

  move(cellId: number) {
    this.matrix.movementTrigger$.next({ id: cellId, player: this.player1 });
    this.opponentTurn$.next(true);
  }
}
