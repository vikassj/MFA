import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpcLineChartComponent } from './mpc-line-chart.component';

describe('MpcLineChartComponent', () => {
  let component: MpcLineChartComponent;
  let fixture: ComponentFixture<MpcLineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MpcLineChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MpcLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
