import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule} from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { HomeComponent } from './components/home/home.component';
import { TicTacToeComponent } from './components/tic-tac-toe/tic-tac-toe.component';
import { OnlineMatchSettingsComponent } from './components/online-match-settings/online-match-settings.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'online',
    component: OnlineMatchSettingsComponent
  },
  {
    path: 'play',
    children: [

      // Play offline
      {
        path: '',
        component: TicTacToeComponent,
      },

      // Play online
      {
        path: ':id',
        component: TicTacToeComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
