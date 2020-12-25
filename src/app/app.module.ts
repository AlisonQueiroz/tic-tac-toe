import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { NgLetDirective } from './shared/directives/ng-let.directive';

@NgModule({
  declarations: [
    AppComponent,
    NgLetDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule
  ],
  exports:[
    MatButtonModule,
    NgLetDirective
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
