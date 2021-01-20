import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {

  isHandset$ = of(true);

  constructor(private breakpointObserver: BreakpointObserver) {}
}
