import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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
  @ViewChild(NgxAuthFirebaseuiAvatarComponent) ngxAuth: NgxAuthFirebaseuiAvatarComponent;

  readonly menuOptions: MenuOption[] = [
    { link: '/', icon: 'home', title: 'Home' },
    { link: '/play', icon: 'videogame_asset', title: 'Play Offline' },
    { link: '/online', icon: 'device_hub', title: 'Play Online' },
  ];

  constructor(
    public cdr: ChangeDetectorRef,
    public service: TicTacToeService,
    public router: Router
  ) {}

  ngAfterViewInit() {
    const userLogEvent = this.ngxAuth.user$;

    const login = userLogEvent.pipe(
      filter(user => !!user?.uid),
      tap(() => this.router.navigate(['./online']))
    );

    const logout = userLogEvent.pipe(
      filter(user => !user?.uid),
      tap(() => this.router.navigate(['./login']))
    );

    const updateUser = userLogEvent.pipe(
      tap(user => {
        this.service.userId$.next(user?.uid);
        this.cdr.detectChanges();
      })
    );

    forkJoin([updateUser, login, logout]).subscribe();
  }
}
