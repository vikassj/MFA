import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsBarChartComponent } from './analytics-bar-chart.component';

describe('AnalyticsBarChartComponent', () => {
  let component: AnalyticsBarChartComponent;
  let fixture: ComponentFixture<AnalyticsBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
