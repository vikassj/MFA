import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsLineChartComponent } from './analytics-line-chart.component';

describe('AnalyticsLineChartComponent', () => {
  let component: AnalyticsLineChartComponent;
  let fixture: ComponentFixture<AnalyticsLineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsLineChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
