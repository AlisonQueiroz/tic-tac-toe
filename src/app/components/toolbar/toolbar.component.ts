import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { NgxAuthFirebaseuiAvatarComponent } from 'ngx-auth-firebaseui';

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

  constructor(public cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.ngxAuth.user$.subscribe(x => this.cdr.detectChanges());
  }
}
