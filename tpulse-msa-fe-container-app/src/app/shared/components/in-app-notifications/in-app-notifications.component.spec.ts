import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InAppNotificationsComponent } from './in-app-notifications.component';

describe('InAppNotificationsComponent', () => {
  let component: InAppNotificationsComponent;
  let fixture: ComponentFixture<InAppNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InAppNotificationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InAppNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
