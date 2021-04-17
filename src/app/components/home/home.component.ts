import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly player = this.fb.control('x', Validators.required);

  constructor(
    public fb: FormBuilder,
    private router: Router,
    public dialog: MatDialog
  ) {}

  play(options?: { online: boolean }) {
    this.router.navigate([options?.online ? 'online' : 'play'], {
      state: { player: this.player.value },
    });
  }
}
