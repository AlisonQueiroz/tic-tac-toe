import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnlineMatchSettingsComponent } from './online-match-settings.component';

describe('OnlineMatchSettingsComponent', () => {
  let component: OnlineMatchSettingsComponent;
  let fixture: ComponentFixture<OnlineMatchSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineMatchSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineMatchSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
