import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthProvider } from 'ngx-auth-firebaseui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly providers = [
    AuthProvider.Google,
    AuthProvider.Twitter,
    AuthProvider.Facebook,
  ];
}
