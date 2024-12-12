import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverViewChartComponent } from './over-view-chart.component';

describe('OverViewChartComponent', () => {
  let component: OverViewChartComponent;
  let fixture: ComponentFixture<OverViewChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverViewChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverViewChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
