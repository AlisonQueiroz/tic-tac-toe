import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  readonly player = this.fb.control('x', Validators.required);

  constructor(public fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {}

  play(options?: { online: boolean }) {
    this.router.navigate([options?.online ? 'online' : 'play'], {
      state: { player: this.player.value },
    });
  }
}
