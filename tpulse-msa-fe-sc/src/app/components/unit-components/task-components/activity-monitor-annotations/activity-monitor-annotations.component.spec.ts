import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityMonitorAnnotationsComponent } from './activity-monitor-annotations.component';

describe('ActivityMonitorAnnotationsComponent', () => {
  let component: ActivityMonitorAnnotationsComponent;
  let fixture: ComponentFixture<ActivityMonitorAnnotationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityMonitorAnnotationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityMonitorAnnotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
