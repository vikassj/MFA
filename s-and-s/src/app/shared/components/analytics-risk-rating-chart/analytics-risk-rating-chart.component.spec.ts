import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsRiskRatingChartComponent } from './analytics-risk-rating-chart.component';

describe('AnalyticsRiskRatingChartComponent', () => {
  let component: AnalyticsRiskRatingChartComponent;
  let fixture: ComponentFixture<AnalyticsRiskRatingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsRiskRatingChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsRiskRatingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
