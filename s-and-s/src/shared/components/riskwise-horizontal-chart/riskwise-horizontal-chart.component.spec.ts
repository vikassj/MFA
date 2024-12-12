import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskwiseHorizontalChartComponent } from './riskwise-horizontal-chart.component';

describe('RiskwiseHorizontalChartComponent', () => {
  let component: RiskwiseHorizontalChartComponent;
  let fixture: ComponentFixture<RiskwiseHorizontalChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskwiseHorizontalChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskwiseHorizontalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
