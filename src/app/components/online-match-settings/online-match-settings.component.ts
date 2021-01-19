import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GameState, TicTacToeService } from 'src/app/store/tic-tac-toe/tic-tac-toe.index';

@Component({
  selector: 'app-online-match-settings',
  templateUrl: './online-match-settings.component.html',
  styleUrls: ['./online-match-settings.component.sass'],
})
export class OnlineMatchSettingsComponent {
  readonly loading$ = new Subject<boolean>();
  readonly matchCode = this.fb.control(null, Validators.required);
  readonly player = history.state.player || 'x';

  constructor(
    public service: TicTacToeService,
    public fb: FormBuilder,
    private router: Router,
    public route: ActivatedRoute
  ) {}

  getGameState() {
    this.loading$.next(true);

    this.service
      .getGameState(this.matchCode.value).pipe(
        tap(x => {
          this.loading$.next(false);
          !x.data
            ? this.matchCode.setErrors({ invalid: 'Invalid match code' })
            : this.redirectToMatch(x);
        })
      ).subscribe();
  }

  createNewMatch() {
    this.loading$.next(true);

    this.service.newGame().pipe(
      tap(x => this.redirectToMatch(x))
    ).subscribe();
  }

  redirectToMatch(x: GameState) {
    return this.router.navigate(['../play', x.id], {
      state: { player: this.player, movements: x.data },
      relativeTo: this.route,
    });
  }
}
