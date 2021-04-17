import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyMatchIdDialogComponent } from './copy-match-id-dialog.component';

describe('CopyMatchIdDialogComponent', () => {
  let component: CopyMatchIdDialogComponent;
  let fixture: ComponentFixture<CopyMatchIdDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CopyMatchIdDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyMatchIdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
