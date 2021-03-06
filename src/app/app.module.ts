import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { NgLetDirective } from './shared/directives/ng-let.directive';
import { HomeComponent } from './components/home/home.component';
import { TicTacToeComponent } from './components/tic-tac-toe/tic-tac-toe.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OnlineMatchSettingsComponent } from './components/online-match-settings/online-match-settings.component';
import { LoginComponent } from './components/login/login.component';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { environment } from 'src/environments/environment';
import { LayoutModule } from '@angular/cdk/layout';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { CopyMatchIdDialogComponent } from './components/copy-match-id-dialog/copy-match-id-dialog.component';

const material = [
  MatIconModule,
  MatListModule,
  MatDialogModule,
  MatInputModule,
  MatButtonModule,
  MatButtonModule,
  MatToolbarModule,
  MatSidenavModule,
  MatButtonToggleModule,
  MatProgressSpinnerModule,
];

@NgModule({
  declarations: [
    AppComponent,
    NgLetDirective,
    TicTacToeComponent,
    HomeComponent,
    OnlineMatchSettingsComponent,
    LoginComponent,
    ToolbarComponent,
    CopyMatchIdDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    ...material,
    LayoutModule,
    ClipboardModule,
    NgxAuthFirebaseUIModule
      .forRoot(
        environment.firebase,
        () => 'expandabletictactoe',
        { authGuardFallbackURL: 'login' }
      )
  ],
  exports: [
    NgLetDirective,
    ...material
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
