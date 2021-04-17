import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameState, TicTacToeService } from 'src/app/store/tic-tac-toe/tic-tac-toe.index';

@Component({
  selector: 'app-online-match-settings',
  templateUrl: './online-match-settings.component.html',
  styleUrls: ['./online-match-settings.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnlineMatchSettingsComponent {
  readonly loading$ = new Subject<boolean>();
  readonly matchCode = this.fb.control(null, Validators.required);
  readonly player = history.state.player || 'x';

  constructor(
    public service: TicTacToeService,
    public fb: FormBuilder,
    private router: Router,
    public route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    if (!this.service.userId$.value) {
      this.router.navigate(['./login']);
    }
  }

  getGameState() {
    this.loading$.next(true);

    this.service
      .getGameState(this.matchCode.value).pipe(
        tap(x => {
          this.loading$.next(false);
          x.id
            ? this.redirectToMatch(x)
            : this.matchCode.setErrors({ invalid: 'Invalid match code' });
        })
      ).subscribe();
  }

  createNewMatch() {
    this.loading$.next(true);

    const userId = this.service.userId$.value;
    const gameState = new GameState(userId, this.player);

    this.service.newGame(gameState).pipe(
      tap(x => this.redirectToMatch(x, true))
    ).subscribe();
  }

  redirectToMatch(gameState: GameState, openDialog = false) {
    return this.router.navigate(['../play', gameState.id], {
      state: { player: this.player, gameState, openDialog },
      relativeTo: this.route,
    });
  }
}
