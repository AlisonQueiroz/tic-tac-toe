import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthProvider, Theme } from 'ngx-auth-firebaseui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  themes = Theme;

  constructor() { }

  ngOnInit(): void {
  }

}
