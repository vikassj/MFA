import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonBarChartComponent } from './comparison-bar-chart.component';

describe('ComparisonBarChartComponent', () => {
  let component: ComparisonBarChartComponent;
  let fixture: ComponentFixture<ComparisonBarChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparisonBarChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparisonBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
