import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgxAuthFirebaseuiAvatarComponent } from 'ngx-auth-firebaseui';
import { forkJoin } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { TicTacToeService } from 'src/app/store/tic-tac-toe/tic-tac-toe.index';

interface MenuOption {
  link: string;
  icon: string;
  title: string;
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements AfterViewInit {
  @ViewChild(NgxAuthFirebaseuiAvatarComponent)
  ngxAuth: NgxAuthFirebaseuiAvatarComponent;

  readonly menuOptions: MenuOption[] = [
    { link: '/', icon: 'home', title: 'Home' },
    { link: '/online', icon: 'device_hub', title: 'Play Online' },
    { link: '/play', icon: 'videogame_asset', title: 'Play Offline' },
  ];

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    public service: TicTacToeService
  ) {}

  ngAfterViewInit() {
    const userLogEvent = this.ngxAuth.user$;

    const login = userLogEvent.pipe(
      filter((user) => !!user?.uid),
      tap(
        () =>
          this.router.url.includes('/login?redirectUrl=%2Fonline') &&
          this.router.navigate(['./online'])
      )
    );

    const logout = userLogEvent.pipe(
      filter((user) => !user?.uid),
      tap(
        () =>
          (this.router.url.includes('/online') ||
            this.router.url.includes('/play/')) &&
          this.router.navigate(['./login'])
      )
    );

    const updateUser = userLogEvent.pipe(
      tap((user) => {
        this.service.userId$.next(user?.uid);
        this.cdr.detectChanges();
      })
    );

    forkJoin([updateUser, login, logout]).subscribe();
  }
}
