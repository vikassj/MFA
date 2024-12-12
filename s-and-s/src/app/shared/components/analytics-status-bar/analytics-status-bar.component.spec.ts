import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsStatusBarComponent } from './analytics-status-bar.component';

describe('AnalyticsStatusBarComponent', () => {
  let component: AnalyticsStatusBarComponent;
  let fixture: ComponentFixture<AnalyticsStatusBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsStatusBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
