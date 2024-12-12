import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsFunnelChartComponent } from './analytics-funnel-chart.component';

describe('AnalyticsFunnelChartComponent', () => {
  let component: AnalyticsFunnelChartComponent;
  let fixture: ComponentFixture<AnalyticsFunnelChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticsFunnelChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsFunnelChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
