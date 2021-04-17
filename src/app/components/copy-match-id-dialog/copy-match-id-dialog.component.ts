import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  matchId: string;
}

@Component({
  selector: 'app-copy-match-id-dialog',
  templateUrl: './copy-match-id-dialog.component.html',
  styleUrls: ['./copy-match-id-dialog.component.sass']
})

export class CopyMatchIdDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<CopyMatchIdDialogComponent>
  ) { this.dialogRef.disableClose = true; }

}
